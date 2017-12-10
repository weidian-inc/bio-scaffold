function Add({ entryObj, port }) {
    Object.keys(entryObj).forEach((key) => {
        entryObj[key].unshift(`webpack-dev-server/client?http://localhost:${port}`, 'webpack/hot/dev-server');
    });
}

Add.prototype.apply = () => {

};

module.exports = Add;
