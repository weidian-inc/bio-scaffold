module.exports = (finalConfig) => {
    const { commonJs, srcFolder, buildFolder, currentEnv, replace, webpackConfig, hashStatic, afterBuild } = finalConfig;

    const webpack = require('webpack');
    const path = require('path');
    const merge = require('webpack-merge');
    const WebpackOnBuildPlugin = require('on-build-webpack');
    const PluginNoop = require('./utils/plugin-noop');
    const PluginClean = require('./utils/plugin-clean');

    let afterBuildDelayTime = null;

    let commonWebpackConfig = merge({
            entry: Object.assign((commonJs ? { vendor: ['vue', 'core-js'] } : {}), require('./utils/util-get-entry-obj')(finalConfig)),
            output: {
                path: path.join(buildFolder, '/static/'),
                filename: hashStatic ? '[name].[chunkhash].js' : '[name].js',
                publicPath: '/static/',
                chunkFilename: hashStatic ? '[name].[chunkhash].js' : '[name].js',
            },
            module: {
                rules: [{
                    test: /\.(jpg|png|gif)$/,
                    use: 'url-loader?name=img/[hash].[ext]&limit=8000',
                    enforce: 'post'
                }, {
                    test: /\.(woff|svg|eot|ttf)\??.*$/,
                    use: 'url-loader?name=img/[hash].[ext]&limit=10',
                    enforce: 'post'
                }, {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    enforce: 'post',
                    exclude: {
                        test: [
                            path.join(srcFolder, 'node_modules'),
                            path.join(__dirname, '../node_modules')
                        ],
                        exclude: [
                            
                        ]
                    }
                }, {
                    test: /\.[(js)(vue)(vuex)(tpl)(html)]*$/,
                    enforce: 'pre',
                    exclude: /(node_modules|bower_components)/,
                    loader: require('./utils/util-get-replace-loader')(replace, currentEnv),
                }],
            },
            resolve: {
                modules: [
                    path.resolve(srcFolder, 'node_modules/'),
                    path.resolve(__dirname, '../node_modules/'),
                ],
                extensions: ['.js', '.json', '.vue']
            },
            resolveLoader: {
                modules: [
                    path.resolve(srcFolder, 'node_modules/'),
                    path.resolve(__dirname, '../node_modules/'),
                ],
            },
            plugins: [
                new PluginClean({
                    buildFolder
                }),
                afterBuild ? new WebpackOnBuildPlugin(() => {
                    clearTimeout(afterBuildDelayTime);

                    afterBuildDelayTime = setTimeout(() => {
                        afterBuild(buildFolder);
                        clearTimeout(afterBuildDelayTime);
                    }, 500);
                }) : new PluginNoop(),
                hashStatic ? new webpack.HashedModuleIdsPlugin() : new PluginNoop()
            ],
        }, webpackConfig);

    // 默认是有 vendor 配置的，如果用户不希望生成 common.js，则删去默认的 vendor
    if (!finalConfig.commonJs) {
        delete commonWebpackConfig.entry.vendor;
    }

    // 如果用户设置了 vendor，则覆盖默认的 vendor
    if (webpackConfig && webpackConfig.entry && webpackConfig.entry.vendor) {
        commonWebpackConfig.entry.vendor = webpackConfig.entry.vendor;
    }

    return commonWebpackConfig;
};
