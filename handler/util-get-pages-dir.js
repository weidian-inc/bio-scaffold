module.exports = (srcDir) => {
    const path = require('path');
    const pageSDir = path.join(srcDir, 'pages');

    return pageSDir;
};