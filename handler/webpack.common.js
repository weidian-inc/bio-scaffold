module.exports = ({ context, fastConfig }) => {
    const { srcDir, distDir, taskName } = context;
    const { replace, webpackConfig } = fastConfig;

    const webpack = require('webpack');
    const path = require('path');
    const fs = require('fs');
    const StringReplacePlugin = require('string-replace-webpack-plugin');
    const merge = require('webpack-merge');

    const PluginClean = require('./plugin-clean');

    const getEntryObj = () => {
        const entryFiles = {};
        const pageDir = path.join(srcDir, 'pages');

        fs.readdirSync(pageDir).forEach((file) => {
            const state = fs.statSync(path.join(pageDir, file));
            const dirname = path.basename(file);
            const indexFile = path.join(srcDir, 'pages', dirname, 'index.js');

            if (state.isDirectory(file) && fs.existsSync(indexFile)) {
                entryFiles[`${dirname}/index`] = [
                    'babel-polyfill',
                    indexFile
                ];
            }
        });

        return entryFiles;
    };

    const getReplaceLoader = (replaceObj) => {
        const replacements = [];

        Object.keys(replaceObj).forEach((key) => {
            replacements.push({
                pattern: new RegExp(key.replace(/\$/g, '\\$'), 'g'),
                replacement() {
                    return replaceObj[key][taskName];
                },
            });
        });

        return StringReplacePlugin.replace({
            replacements,
        });
    };

    let commonWebpackConfig = {
        entry: getEntryObj(),
        output: {
            path: path.join(distDir, '/static/'),
            filename: '[name].js',
            publicPath: '/static/',
            chunkFilename: '[name].js',
        },
        module: {
            rules: [{
                test: /\.jpg$/,
                use: 'url-loader?name=img/[hash].[ext]&mimetype=image/jpg&limit=8000',
            }, {
                test: /\.png$/,
                use: 'url-loader?name=img/[hash].[ext]&mimetype=image/png&limit=8000',
            }, {
                test: /\.gif$/,
                use: 'url-loader?name=img/[hash].[ext]&mimetype=image/gif&limit=8000',
            }, {
                test: /\.(woff|svg|eot|ttf)\??.*$/,
                use: 'url-loader?name=img/[hash].[ext]&limit=10',
            }, {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [
                    srcDir,
                ],
            }, {
                test: /\.[(js)(vue)(vuex)(html)]*$/,
                exclude: /(node_modules|bower_components)/,
                loader: getReplaceLoader(replace, taskName),
            }],
        },
        resolve: {
            alias: {
                vue: 'vue/dist/vue.common.js',
            },
            modules: [
                path.resolve(srcDir, 'node_modules/'),
                path.resolve(__dirname, '../node_modules/'),
            ],
        },
        resolveLoader: {
            modules: [
                path.resolve(srcDir, 'node_modules/'),
                path.resolve(__dirname, '../node_modules/'),
            ],
        },
        plugins: [
            new PluginClean({
                distDir,
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                filename: 'common.js',
                minChunks: Infinity,
            }),
        ],
    };

    // merge fast config
    commonWebpackConfig = merge(commonWebpackConfig, webpackConfig);

    return commonWebpackConfig;
};
