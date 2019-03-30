module.exports = ({ srcDir, distDir, taskName, replace, webpackConfig }) => {
    const webpack = require('webpack');
    const path = require('path');
    const fs = require('fs');
    const StringReplacePlugin = require('string-replace-webpack-plugin');
    const merge = require('webpack-merge');

    const PluginClean = require('./plugin-clean');
    const getPagesDir = require('./util-get-pages-dir');

    const getEntryObj = () => {
        const entryFiles = {};
        const pagesDir = getPagesDir(srcDir);

        fs.readdirSync(pagesDir).forEach((file) => {
            const state = fs.statSync(path.join(pagesDir, file));
            const dirname = path.basename(file);
            const indexFile = path.join(pagesDir, dirname, 'index.js');

            if (state.isDirectory(file) && fs.existsSync(indexFile)) {
                entryFiles[`${dirname}/index`] = [ indexFile ];
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
        optimization: {
            splitChunks: {
                name: 'common.js'
            }
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
                test: /\.[(js)(html)]*$/,
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
            
            // new webpack.optimize.CommonsChunkPlugin({
            //     name: 'vendor',
            //     filename: 'common.js',
            //     minChunks: Infinity,
            // }),
        ],
    };

    // merge fast config
    commonWebpackConfig = merge(commonWebpackConfig, webpackConfig);

    return commonWebpackConfig;
};
