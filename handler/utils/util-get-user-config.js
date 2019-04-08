const fs = require('fs');
const path = require('path');
const isrelative = require('is-relative');

const getDefaultReplace = require('./util-get-default-replace');
const logUtil = require('./util-log');

module.exports = async ({ userFolder, srcFolder, buildFolder, currentEnv, debugPort, webpack, WebpackDevServer, mode }) => {
    // 开放到 bio.config.js 中的 API，设置了一些默认值
    let mergedUserConfig = {
        buildFolder,
        debugPort,
        replace: null,
        alias: null,
        px2rem: null,
        afterBuild: null,
        webpackConfig: {},
        onHtmlBuild: null,
        commonEntry: null,
        hashStatic: false,
        publishWithoutVersion: false,
        polyfill: false,
        gitlabGroup: '',
        gitlabProject: '',
        commonJs: true,
        noWebpackDevServer: false,
    };

    const userConfigFile = path.join(srcFolder, 'bio.config.js');

    if (fs.existsSync(userConfigFile)) {
        let userConfig = require(userConfigFile);

        userConfig = userConfig({ userFolder, srcFolder, buildFolder, currentEnv, webpack, WebpackDevServer });

        // 统一做 merge 处理
        Object.keys(mergedUserConfig).forEach(configName => {
            if (userConfig[configName] !== undefined) {
                mergedUserConfig[configName] = userConfig[configName];
            }
        });
    }

    // 对 buildFolder 特殊处理
    if (mergedUserConfig.buildFolder) {
        if (typeof mergedUserConfig.buildFolder === 'function') {
            mergedUserConfig.buildFolder = mergedUserConfig.buildFolder(userFolder);
        } else if (typeof mergedUserConfig.buildFolder === 'string') {
            if (isrelative(mergedUserConfig.buildFolder)) {
                if (path.join(userFolder, '/') === path.join(userFolder, mergedUserConfig.buildFolder, '/')) {
                    throw new Error('buildFolder 配置不能是当前目录');
                }

                mergedUserConfig.buildFolder = path.join(userFolder, mergedUserConfig.buildFolder);
            }
        } else {
            throw new Error('./bio.config.js 中的 buildFolder 应该是字符串或函数，请填写正确的格式');
        }
    }

    // 对 hashStatic 特殊处理
    if (mergedUserConfig.hashStatic && mode === 'development') {
        mergedUserConfig.hashStatic = false;
        logUtil.warn('本地开发环境下不支持资源 hash');
    }

    // 对 alias 特殊处理
    if (mergedUserConfig.alias) {
        if (!mergedUserConfig.webpackConfig.resolve) {
            mergedUserConfig.webpackConfig.resolve = {};
        }
        if (typeof mergedUserConfig.alias === 'function') {
            Object.assign(mergedUserConfig.webpackConfig.resolve, {
                alias: mergedUserConfig.alias(srcFolder)
            });
        } else if (typeof mergedUserConfig.alias === 'object') {
            Object.assign(mergedUserConfig.webpackConfig.resolve, {
                alias: mergedUserConfig.alias
            });
        }
    }

    // 针对 replace 字段单独处理
    const defaultReplace = await getDefaultReplace({
        userFolder,
        gitlabGroup: mergedUserConfig.gitlabGroup, // 可能有用户配置的默认值
        gitlabProject: mergedUserConfig.gitlabProject, // 可能有用户配置的默认值
        publishWithoutVersion: mergedUserConfig.publishWithoutVersion,
        javaProject: mergedUserConfig.javaProject
    });

    mergedUserConfig.replace = Object.assign(defaultReplace, mergedUserConfig.replace);

    return mergedUserConfig;
};
