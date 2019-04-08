const fs = require('fs');
const path = require('path');

const logUtil = require('./util-log');
const htmlUtil = require('./util-process-html-fns');

function waitTillFolderExists() {
    return new Promise(resolve => {
        const check = () => {
            if (global.vbuilderCompilicationDone) {
                clearInterval(timer);
                resolve();
            }
        };

        const timer = setInterval(check, 1000);
        check();
    });
}

module.exports = (htmlFiles, { replace, currentEnv, userFolder, commonJs, hashStatic, callback, buildFolder, vdaBefore, vdaAfter }) => {
    if (!htmlFiles.length) {
        logUtil.warn(' html 文件不存在，跳过对 html 文件的处理');
        return;
    }

    const CDN_URL = replace['$$_CDNURL_$$'][currentEnv];

    const replaceWithHash = async (content, pageName, staticFolder) => {
        await waitTillFolderExists();

        if (!fs.existsSync(path.join(staticFolder, pageName))) {
            return '';
        }

        // hash 状态下 common.js 叫 vendor.js
        const vendorJsArr = fs.readdirSync(staticFolder).filter(file => /vendor\.[\w]+\.js/.test(file));
        const manifestJs = fs.readdirSync(staticFolder).filter(file => /manifest\.[\w]+\.js/.test(file))[0];
        const currentPageStaticJsArr = fs.readdirSync(path.join(staticFolder, pageName)).filter(file => /[\w]+\.js/.test(file));
        const currentPageStaticCssArr = fs.readdirSync(path.join(staticFolder, pageName)).filter(file => /[\w]+\.css/.test(file));

        const replace = (hashedArr, getToBeReplaced, getReplaced) => {
            hashedArr.forEach(hashedFileName => {
                const unhashedFileName = hashedFileName.replace(/\.[\w]+\./, '.');
                const strToBeReplaced = getToBeReplaced(unhashedFileName);

                while (content.indexOf(strToBeReplaced) !== -1) {
                    content = content.replace(strToBeReplaced, getReplaced(hashedFileName));
                }
            });
        };

        replace(vendorJsArr, () => `<script src="${CDN_URL}/common.js"`, hashedFileName => `<script>${fs.readFileSync(path.join(staticFolder, manifestJs), 'utf8')}</script><script src="${CDN_URL}/${hashedFileName}"`);
        replace(currentPageStaticJsArr, unhashedFileName => `src="${CDN_URL}/${pageName}/${unhashedFileName}"`, hashedFileName => `src="${CDN_URL}/${pageName}/${hashedFileName}"`);
        replace(currentPageStaticCssArr, unhashedFileName => `href="${CDN_URL}/${pageName}/${unhashedFileName}"`, hashedFileName => `href="${CDN_URL}/${pageName}/${hashedFileName}"`);

        return content;
    };

    let pageCount = 0;
    htmlFiles.forEach(async (htmlFilePath) => {
        const pageName = path.basename(htmlFilePath, '.html');
        let content = fs.readFileSync(htmlFilePath, 'utf8');

        content = htmlUtil.autoInsertJsAndCss(pageName, content, CDN_URL, commonJs);
        content = htmlUtil.removeComment(content);

        if (hashStatic) {
            const replaceResult = await replaceWithHash(content, pageName, path.join(buildFolder, 'static'));

            if (replaceResult) {
                content = replaceResult;
            }
        }

        // 写入 html 文件
        fs.writeFileSync(htmlFilePath, content);

        pageCount++;
        if (callback && pageCount === htmlFiles.length) {
            callback();
        }
    });
};

