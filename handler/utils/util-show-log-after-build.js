const fs = require('fs');
const path = require('path');
const logUtil = require('./util-log');

const checkHtmlCountEquals = (srcFolder, buildFolder) => {
    const entryPagesDir = require('./util-get-entry-pages-folder')(srcFolder);

    let srcHtmlCount = 0;
    fs.readdirSync(entryPagesDir).forEach(dirname => {
        if (fs.existsSync(path.join(entryPagesDir, dirname, 'index.html'))) {
            srcHtmlCount++;
        }
    });

    let buildHtmlCount = 0;
    require('recursive-readdir-sync')(buildFolder).forEach(filepath => {
        if (/\.html$/.test(filepath)) {
            buildHtmlCount++;
        }
    });

    if (buildHtmlCount >= srcHtmlCount) {
        return true;
    }

    return false;
};

let remindLogDelayTimer;
let intervalTimer;
module.exports = ({ currentEnv, srcFolder, buildFolder, debugPort, vdaBefore, vdaAfter }) => {
    clearInterval(intervalTimer);

    intervalTimer = setInterval(() => {
        if (fs.existsSync(buildFolder) && checkHtmlCountEquals(srcFolder, buildFolder)) {
            clearInterval(intervalTimer);

            if (/\-locally/.test(currentEnv)) {
                logUtil.log('Compilication done.');
            } else {
                clearTimeout(remindLogDelayTimer);

                remindLogDelayTimer = setTimeout(() => {
                    // 遍历 build 目录
                    if (fs.existsSync(buildFolder)) {
                        const pages = require('recursive-readdir-sync')(buildFolder).filter(filepath => !/static\//.test(filepath.replace(buildFolder, '')) && /\.html$/.test(filepath)).map(filepath => filepath.replace(buildFolder, ''));

                        if (pages.length === 0) {
                            logUtil.warn('no pages found such as: ./src/index/index.html');
                        } else {
                            pages.map((pagePath, index) => logUtil.log(`[${index}] http://localhost:${debugPort}${pagePath}`));
                        }
                    }
                    clearTimeout(remindLogDelayTimer);
                }, 2000);
            }
        }
    }, 1000);
};
