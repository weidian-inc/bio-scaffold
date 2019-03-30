module.exports = (context) => {
    const webpack = require('webpack');
    const WebpackOnBuildPlugin = require('on-build-webpack');
    const merge = require('webpack-merge');
    const WebpackDevServer = require('webpack-dev-server');

    const PluginCreateBlankCss = require('./plugin-create-blank-css');
    const PluginPresetHtml = require('./plugin-preset-html');
    const WriteFilePlugin = require('write-file-webpack-plugin');

    const fs = require('fs');
    const path = require('path');

    // reset context
    const userConfig = require('./util-get-user-config')({ ...context, webpack, WebpackDevServer });

    // 覆盖默认的 context 配置
    Object.assign(context, userConfig);

    const { srcDir, distDir, taskName, port, replace } = context;

    const commonWebpackConfig = require('./webpack.common')(context);

    Object.keys(commonWebpackConfig.entry).forEach((key) => {
        commonWebpackConfig.entry[key].unshift(`webpack-dev-server/client?http://localhost:${port}`, 'webpack/hot/dev-server');
    });

    const VueLoaderPlugin = require('vue-loader/lib/plugin')

    let onbuildLogTimer = null;
    const finalWebpackConfig = merge.smart(commonWebpackConfig, {
        mode: 'development',
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: ['vue-style-loader', 'css-loader', 'postcss-loader'],
                    // enforce: 'post'
                }, {
                    test: /\.less$/,
                    use: ['vue-style-loader', 'css-loader', 'postcss-loader', 'less-loader'],
                    // enforce: 'post'
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
                    // enforce: 'post'
                }
            ]
        },
        plugins: [
            new VueLoaderPlugin(),
            new PluginPresetHtml({
                srcDir,
                distDir,
                watch: true,
                replace,
                taskName,
            }),
            new PluginCreateBlankCss({
                entryObj: commonWebpackConfig.entry,
                targetDir: path.join(distDir, 'static'),
            }),
            new webpack.HotModuleReplacementPlugin(),
            new WebpackOnBuildPlugin(() => {
                clearTimeout(onbuildLogTimer);
                onbuildLogTimer = setTimeout(() => {
                    // 遍历 build 目录
                    const pagesDir = path.join(distDir, 'pages');
                    if (fs.existsSync(pagesDir) && fs.statSync(pagesDir)) {
                        const pages = fs.readdirSync(pagesDir);
                        const str = pages.map(pagePath => `http://localhost:${port}/pages/${pagePath}`).join('\n');

                        if (pages.length === 0) {
                            console.log(`no pages found...`.yellow);
                        } else if (pages.length === 1) {
                            pages.map(pagePath => console.log(`${'[debug url]'.green} http://localhost:${port}/pages/${pagePath}`));
                        } else {
                            pages.map((pagePath, index) => console.log(`${('[debug url ' + index + ']').green} http://localhost:${port}/pages/${pagePath}`));
                        }
                    }
                    clearTimeout(onbuildLogTimer);
                }, 1000);
            }),
            new WriteFilePlugin(),
        ],
    });

    const server = new WebpackDevServer(webpack(finalWebpackConfig), {
        contentBase: distDir,
        hot: true,
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

    console.log('webpack: Compiling...');
    server.listen(port);
};
