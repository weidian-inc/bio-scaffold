module.exports = async ({ userFolder, srcFolder, buildFolder, currentEnv }) => {
    const VUE_PATH = 'vue/dist/vue.common.js';

    const webpack = require('webpack');
    const merge = require('webpack-merge');
    const logUtil = require('./utils/util-log');

    const ExtractTextPlugin = require('extract-text-webpack-plugin');
    const NoopPlugin = require('./utils/plugin-noop');
    const finalConfig = require('./utils/util-merge')(
        { userFolder, srcFolder, buildFolder, currentEnv },
        await require('./utils/util-get-user-config')({ userFolder, srcFolder, buildFolder, currentEnv, webpack, mode: 'production' })
    );

    const { cssLoaders, lessLoaders, sassLoaders } = require('./utils/util-get-style-loaders').getProd({ ...finalConfig, ExtractTextPlugin });

    const finalWebpackConfig = merge.smart(require('./webpack.common')(finalConfig), {
            output: global.vbuilder_is_in_zebra ? { publicPath: finalConfig.replace['$$_CDNURL_$$'][currentEnv] + '/' } : {},
            resolve: {
                alias: {
                    'vue$': VUE_PATH,
                },
            },
            stats: {
                errors: true
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
                                        sass: sassLoaders,
                                    },
                                },
                            }, 
                        ],
                        include: [
                            srcFolder
                        ],
                    }]
            },
            plugins: [
                new webpack.DefinePlugin({
                    'process.env': {
                        NODE_ENV: '"production"',
                    },
                }),
                new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: true,
                    },
                }),
                new ExtractTextPlugin({
                    filename: finalConfig.hashStatic ? '[name].[contenthash].css' : '[name].css',
                    disable: false,
                    allChunks: true // 将所有 css 全部抽离到 css 文件，包括异步组件中的 css
                }),
                (finalConfig.commonJs && finalConfig.hashStatic) ? new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', minChunks: Infinity, }) : new NoopPlugin(),
                (finalConfig.commonJs && finalConfig.hashStatic) ? new webpack.optimize.CommonsChunkPlugin({ name: 'manifest', chunks: ['vendor'] }) : new NoopPlugin(),
                (finalConfig.commonJs && !finalConfig.hashStatic) ? new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'common.js', minChunks: Infinity, }) : new NoopPlugin(),
            ],
        });

    // 启动 html 处理程序
    require('./utils/util-process-html')({ ...finalConfig, watch: false, compress: true });

    // 启动 webpack
    logUtil.log('webpack: Compiling...');
    webpack(finalWebpackConfig, (err, stats) => {
        if (err) {
            logUtil.error('Compilication failed.');

            console.error(err.stack || err);
            if (err.details) {
                console.error(err.details);
            }
            process.exit(1);
            return;
        }

        const info = stats.toJson();

        if (stats.hasErrors()) {
            let hasBuildError = false;

            for (let i = 0, len = info.errors.length; i < len; i++) {
                if (!/from\s*UglifyJs/i.test(info.errors[i])) {
                    hasBuildError = true;
                    break;
                }
            }

            if (hasBuildError) {
                logUtil.error('Compilication failed.');
                console.error(info.errors);
                process.exit(1);
            }
        }

        if (stats.hasWarnings()) {
            // console.warn(info.warnings);
        }

        global.vbuilderCompilicationDone = true;
        logUtil.log('Compilication done.');
    });
};
