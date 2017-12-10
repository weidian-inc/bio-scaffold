const fs = require('fs');
const path = require('path');
const isrelative = require('is-relative');

module.exports = (params) => {
    const { userDir, srcDir, distDir, port } = params;

    const finalConfig = {
        context: {
            distDir,
            port,
        },
        fastConfig: {
            replace: null,
            webpackConfig: null,
        },
    };

    const classifyConfig = (userConfig) => {
        const { context, fastConfig } = finalConfig;

        const merge = (target, names) => {
            names.forEach((key) => {
                if (userConfig[key]) {
                    target[key] = userConfig[key];
                }
            });
        };

        // context
        merge(context, ['port', 'distDir']);

        if (isrelative(context.distDir)) {
            context.distDir = path.join(userDir, context.distDir);
        }

        // fastConfig
        merge(fastConfig, ['replace', 'webpackConfig']);
    };

    const userConfigFile = path.join(srcDir, 'bio.config.js');
    if (fs.existsSync(userConfigFile)) {
        classifyConfig(require(userConfigFile)(params), finalConfig);
    }

    return finalConfig;
};
