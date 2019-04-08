module.exports = async ({ userFolder, srcFolder, buildFolder, currentEnv, debugPort }) => {
    const VUE_PATH = 'vue/dist/vue.js';

    const path = require('path');
    const fs = require('fs');
    const fse = require('fs-extra');
    const webpack = require('webpack');

    // 监听 webpack 构建结束的插件
    const WebpackOnBuildPlugin = require('on-build-webpack');
    const merge = require('webpack-merge');
    const WebpackDevServer = require('webpack-dev-server');

    const logUtil = require('./utils/util-log');

    // 解析包资源大小的插件
    const WriteFilePlugin = require('write-file-webpack-plugin');
    const PluginCreateBlankCss = require('./utils/plugin-create-blank-css');
    const PluginNoop = require('./utils/plugin-noop');

    const finalConfig = require('./utils/util-merge')(
        { userFolder, srcFolder, buildFolder, currentEnv, debugPort }, 
        await require('./utils/util-get-user-config')({ userFolder, srcFolder, buildFolder, currentEnv, debugPort, webpack, WebpackDevServer, mode: 'development' })
    );

    const { cssLoaders, lessLoaders, sassLoaders } = require('./utils/util-get-style-loaders').getDev(finalConfig);

    const finalWebpackConfig = merge.smart(require('./webpack.common')(finalConfig), {
            resolve: {
                alias: {
                    'vue$': VUE_PATH,
                },
            },
            module: {
                rules: [{
                        test: /\.css$/,
                        use: cssLoaders,
                    }, {
                        test: /\.less$/,
                        use: lessLoaders,
                    }, {
                        test: /\.(scss|sass)$/,
                        use: sassLoaders,
                    }, {
                        test: /\.vue$/,
                        use: [{
                                loader: 'vue-loader',
                                options: {
                                    loaders: {
                                        css: cssLoaders,
                                        less: lessLoaders,
                                        sass: sassLoaders
                                    },
                                },
                            },
                        ],
                        include: [
                            finalConfig.srcFolder,
                        ],
                    }]
            },
            plugins: [
                new PluginCreateBlankCss({
                    entryObj: require('./utils/util-get-entry-obj')(finalConfig),
                    targetDir: path.join(finalConfig.buildFolder, 'static')
                }),
                new WriteFilePlugin(),
                (finalConfig.commonJs && finalConfig.hashStatic) ? new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', minChunks: Infinity, }) : new PluginNoop(),
                (finalConfig.commonJs && finalConfig.hashStatic) ? new webpack.optimize.CommonsChunkPlugin({ name: 'manifest', chunks: ['vendor'] }) : new PluginNoop(),
                (finalConfig.commonJs && !finalConfig.hashStatic) ? new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'common.js', minChunks: Infinity, }) : new PluginNoop(),
            ]
        });

    // 启动 html 监听程序
    require('./utils/util-process-html')({ ...finalConfig, watch: true, });

    logUtil.log(`webpack: Compiling...`);

    // 启动 webpack
    if (finalConfig.noWebpackDevServer) {
        finalWebpackConfig.watch = true;
        webpack(finalWebpackConfig, (err) => {
            if (err) {
                logUtil.error('Compilication failed.');

                console.error(err.stack || err);
                if (err.details) {
                    console.error(err.details);
                }
                process.exit(1);
                return;
            }

            logUtil.log('Compilication done.');
        });
        require('./utils/util-check-restart')({ finalConfig });
    } else {
        finalWebpackConfig.plugins.push(
            new webpack.HotModuleReplacementPlugin(),
            new WebpackOnBuildPlugin(() => {
                require('./utils/util-show-log-after-build')(finalConfig);
            })
        );
        Object.keys(finalWebpackConfig.entry).forEach((key) => {
            if (key !== 'vendor' && typeof finalWebpackConfig.entry[key].unshift === 'function') {
                finalWebpackConfig.entry[key].unshift(`webpack-dev-server/client?http://localhost:${finalConfig.debugPort}`, 'webpack/hot/dev-server');
            }
        });
        const webpackServer = new WebpackDevServer(webpack(finalWebpackConfig), {
            contentBase: finalConfig.buildFolder,
            // hot: true,
            historyApiFallback: true,
            quiet: false,
            noInfo: false,
            stats: 'errors-only',
            publicPath: finalWebpackConfig.output.publicPath,
            disableHostCheck: true,
            watchOptions: {
                ignored: /\/node_modules\//,
                poll: 300,
            },
        });

        webpackServer.listen(finalConfig.debugPort);
        require('./utils/util-check-restart')({ webpackServer, finalConfig });
    }
};
