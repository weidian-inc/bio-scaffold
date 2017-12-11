module.exports = (context) => {
    const webpack = require('webpack');
    const merge = require('webpack-merge');

    const ExtractTextPlugin = require('extract-text-webpack-plugin');
    const PluginPresetHtml = require('./plugin-preset-html');

    // reset context
    const userConfig = require('./util-get-user-config')({ ...context, webpack });

    const { fastConfig } = userConfig;
    const { replace } = fastConfig;

    Object.assign(context, userConfig.context);

    const { srcDir, distDir, taskName } = context;

    const common = require('./webpack.common')({ context, fastConfig });

    const finalWebpackConfig = merge(common, {
        plugins: [
            new PluginPresetHtml({
                srcDir,
                distDir,
                watch: false,
                compress: true,
                replace,
                taskName,
            }),
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
                filename: '[name].css',
                disable: false,
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: true,
                },
            }),
        ],
    });

    finalWebpackConfig.module.rules.unshift({
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                use: ['css-loader?minimize', 'postcss-loader'],
                fallback: 'vue-style-loader',
            }),
        }, {
            test: /\.less$/,
            use: ExtractTextPlugin.extract({
                use: ['css-loader?minimize', 'postcss-loader', 'less-loader'],
                fallback: 'vue-style-loader',
            }),
        }, {
            test: /\.vue$/,
            loader: 'vue-loader',
            include: [
                srcDir,
            ],
            options: {
                loaders: {
                    css: ExtractTextPlugin.extract({
                        use: ['css-loader?minimize', 'postcss-loader'],
                        fallback: 'vue-style-loader',
                    }),
                    less: ExtractTextPlugin.extract({
                        use: ['css-loader?minimize', 'postcss-loader', 'less-loader'],
                        fallback: 'vue-style-loader',
                    }),
                },
            },
        });

    console.log('Compiling...');
    webpack(finalWebpackConfig, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Compilication done.');
        }
    });
};
