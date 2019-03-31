module.exports = (context) => {
    const webpack = require('webpack');
    const merge = require('webpack-merge');

    const ExtractTextPlugin = require('extract-text-webpack-plugin');
    const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

    const PluginPresetHtml = require('./plugin-preset-html');

    // reset context
    const userConfig = require('./util-get-user-config')({ ...context, webpack });

    Object.assign(context, userConfig);

    const { srcDir, distDir, taskName, replace } = context;

    const commonWebpackConfig = require('./webpack.common')(context);

    const finalWebpackConfig = merge(commonWebpackConfig, {
        // mode: 'production',
        // optimization: {
        //     minimizer: [
        //         new UglifyJsPlugin({
        //             uglifyOptions: {
        //                 compress: true
        //             }
        //         })
        //     ] 
        // },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: ExtractTextPlugin.extract({
                        use: ['css-loader?minimize', 'postcss-loader'],
                        fallback: 'vue-style-loader',
                    }),
                    // enforce: 'post'
                }, {
                    test: /\.less$/,
                    use: ExtractTextPlugin.extract({
                        use: ['css-loader?minimize', 'postcss-loader', 'less-loader'],
                        fallback: 'vue-style-loader',
                    }),
                    // enforce: 'post'
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
                    // enforce: 'post'
                }
            ]
        },
        plugins: [
            new PluginPresetHtml({
                srcDir,
                distDir,
                watch: false,
                compress: true,
                replace,
                taskName,
            }),
            // new webpack.DefinePlugin({
            //     'process.env': {
            //         NODE_ENV: '"production"',
            //     },
            // }),
            new ExtractTextPlugin({
                filename: '[name].css',
                disable: false,
            }),
        ],
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
