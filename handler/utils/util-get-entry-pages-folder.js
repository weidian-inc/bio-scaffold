const fs = require('fs');
const path = require('path');

module.exports = (srcFolder) => {
    let pageDir;

    const pageDirList = require('./util-global-config').supportedPagesDirName;

    for (let i = 0, len = pageDirList.length; i < len; i++) {
        const pageDirPath = path.join(srcFolder, pageDirList[i]);

        if (fs.existsSync(pageDirPath) && fs.statSync(pageDirPath).isDirectory(pageDirPath)) {
            pageDir = pageDirPath;
            break;
        }
    }

    if (!pageDir) {
        throw new Error('no entry js files found such as: ./pages/index、./src/pages/index/、./src/index/');
    }

    return pageDir;
};