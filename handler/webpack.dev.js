module.exports = (context) => {
    const webpack = require('webpack');
    const WebpackOnBuildPlugin = require('on-build-webpack');
    const merge = require('webpack-merge');
    const WebpackDevServer = require('webpack-dev-server');

    const PluginCreateBlankCss = require('./plugin-create-blank-css');
    const PluginPresetHtml = require('./plugin-preset-html');
    const WriteFilesFromMemory = require('./plugin-write-files-from-memory');

    const path = require('path');

    // reset context
    const userConfig = require('./util-get-user-config')({ ...context, webpack, WebpackDevServer });

    const { fastConfig } = userConfig;
    const { replace } = fastConfig;

    Object.assign(context, userConfig.context);

    const { srcDir, distDir, taskName, port } = context;

    const common = require('./webpack.common')({ context, fastConfig });

    let isFirstBuild = true;
    const finalWebpackConfig = merge.smart(common, {
        plugins: [
            new PluginPresetHtml({
                srcDir,
                distDir,
                watch: true,
                replace,
                taskName,
            }),
            new PluginCreateBlankCss({
                entryObj: common.entry,
                targetDir: path.join(distDir, 'static'),
            }),
            new webpack.HotModuleReplacementPlugin(),
            new WebpackOnBuildPlugin(() => {
                if (isFirstBuild) {
                    isFirstBuild = false;
                    const timer = setTimeout(() => {
                        console.log([
                            `debug url 1: http://localhost:${port}/pages/index.html`,
                            `debug url 2: http://127.0.0.1:${port}/pages/index.html`,
                        ].join('\n'));
                        clearTimeout(timer);
                    }, 1000);
                }
            }),
            new WriteFilesFromMemory(),
        ],
    });

    finalWebpackConfig.module.rules.unshift({
            test: /\.css$/,
            use: ['vue-style-loader', 'css-loader', 'postcss-loader'],
        }, {
            test: /\.less$/,
            use: ['vue-style-loader', 'css-loader', 'postcss-loader', 'less-loader'],
        }, {
            test: /\.vue$/,
            loader: 'vue-loader',
            include: [srcDir],
            options: {
                loaders: {
                    css: ['vue-style-loader', 'css-loader', 'postcss-loader'],
                    less: ['vue-style-loader', 'css-loader', 'postcss-loader', 'less-loader'],
                },
            },
        });

    Object.keys(finalWebpackConfig.entry).forEach((key) => {
        finalWebpackConfig.entry[key].unshift(`webpack-dev-server/client?http://localhost:${port}`, 'webpack/hot/dev-server');
    });

    const server = new WebpackDevServer(webpack(finalWebpackConfig), {
        contentBase: distDir,
        hot: true,
        historyApiFallback: true,
        quiet: false,
        noInfo: false,
        stats: {
            chunks: false,
            colors: true,
        },
        publicPath: finalWebpackConfig.output.publicPath,
        disableHostCheck: true,
        watchOptions: {
            ignored: /\/node_modules\//,
            poll: 300,
        },
    });

    console.log('Compiling...');
    server.listen(port);
};
