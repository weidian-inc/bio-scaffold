const getEntryObj = ({ srcFolder, polyfill, indexFileName = 'index.js' }) => {
    // entry.vendor 优先使用用户配置的 vendor，覆盖式
    const fs = require('fs');
    const path = require('path');

    const entryFiles = {};

    let pageDir = require('./util-get-entry-pages-folder')(srcFolder);
    const logUtil = require('./util-log');

    if (!pageDir) {
        logUtil.warn('no entry js file found such as: ./src/pages/index/index.js');
        process.exit(1);
        return;
    }

    fs.readdirSync(pageDir).forEach((fileName) => {
        const dirpath = path.join(pageDir, fileName);
        const indexJsFile = path.join(dirpath, indexFileName);
        const dirname = path.basename(dirpath);

        // 如果 js 文件不存在
        if (fs.existsSync(indexJsFile)) {
            if (!polyfill) {
                entryFiles[`${dirname}/index`] = [
                    indexJsFile
                ];
            } else {
                entryFiles[`${dirname}/index`] = [
                    'babel-polyfill',
                    indexJsFile
                ];
            }
        }
    });

    return entryFiles;
};

module.exports = getEntryObj;
