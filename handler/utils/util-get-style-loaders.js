const getProd = ({ px2rem, ExtractTextPlugin }) => {
    let cssLoaders = ExtractTextPlugin.extract({
        use: ['css-loader?minimize', 'postcss-loader'],
        fallback: 'vue-style-loader'
    });

    let lessLoaders = ExtractTextPlugin.extract({
        use: ['css-loader?minimize', 'postcss-loader', 'less-loader'],
        fallback: 'vue-style-loader'
    });

    let sassLoaders = ExtractTextPlugin.extract({
        use: ['css-loader?minimize', 'postcss-loader', 'sass-loader'],
        fallback: 'vue-style-loader'
    });

    return {
        cssLoaders, lessLoaders, sassLoaders
    };
};

const getDev = ({ px2rem }) => {
    let cssLoaders = ['vue-style-loader', 'css-loader', 'postcss-loader'];
    let lessLoaders = ['vue-style-loader', 'css-loader', 'postcss-loader', 'less-loader'];
    let sassLoaders = ['vue-style-loader', 'css-loader', 'postcss-loader', 'sass-loader'];

    return {
        cssLoaders,
        lessLoaders,
        sassLoaders
    };
};

module.exports = {
    getDev,
    getProd
};

