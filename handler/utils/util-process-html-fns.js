const logUtil = require('./util-log');

module.exports = {
    removeComment(content) {
        const commentReg = /\<\!\-\-[\s\S]+?\-\-\>/i;
        return content.split(commentReg).join('');
    },
    removeUselessScript(content, scriptRegArr) {
        let result = content;

        const scriptReg = /\<script[\s\S]+?\<\/script\>/g;

        const arr = result.match(scriptReg);

        if (arr) {
            arr.forEach((item) => {
                scriptRegArr.forEach(reg => {
                    if (reg.test(item)) {
                        result = result.split(item).join('');
                    }
                });
            });
        }

        return result;
    },
    shiftScriptInBody(content, scriptUrl) {
        let bodyIndex = content.indexOf('<body');

        if (bodyIndex === -1) {
            return content;
        }

        let htmlPart1Str = content.substring(0, bodyIndex);
        let bodyStr = content.substring(bodyIndex);

        const scriptIndex = bodyStr.indexOf('<script');

        let splitStr = '<script';

        if (scriptIndex === -1) {
            splitStr = '</body>';
        }

        const tempIndex = bodyStr.indexOf(splitStr);

        if (tempIndex !== -1) {
            bodyStr = `${bodyStr.substring(0, tempIndex)}${scriptUrl}\n${bodyStr.substring(tempIndex)}`;
        }

        return htmlPart1Str + bodyStr;
    },
    pushInCss(content, inserted) {
        let bodyIndex = content.indexOf('</head>');

        if (bodyIndex === -1) {
            return content;
        }

        const resultStr = content.replace('</head>', `${inserted}${'</head>'}`)

        return resultStr;
    },
    pushInBody(content, inserted) {
        let bodyIndex = content.indexOf('</body>');

        if (bodyIndex === -1) {
            return content;
        }

        const resultStr = content.replace('</body>', `${inserted}${'</body>'}`)

        return resultStr;
    },

    autoInsertJsAndCss(pageName, content, CDN_URL, commonJs) {
        // replace js
        const commonJsString = content.indexOf(`<script src="${CDN_URL}/common.js"></script>`) !== -1;

        const hasIndexJsString = content.indexOf(`<script src="${CDN_URL}/${pageName}/index.js"></script>`) !== -1;
        const autoJsReg = /\<\!-\-\s*auto\-js\s*\-\-\>/;
        const hasAutoJsComment = autoJsReg.test(content);

        if (hasAutoJsComment && !commonJsString && !hasIndexJsString) {
            if (commonJs) {
                content = content.replace(autoJsReg, `<script src="${CDN_URL}/common.js"></script><script src="${CDN_URL}/${pageName}/index.js"></script>`);
            } else {
                content = content.replace(autoJsReg, `<script src="${CDN_URL}/${pageName}/index.js"></script>`);
            }
        }

        // replace css
        const autoCssReg = /\<\!-\-\s*auto\-css\s*\-\-\>/;
        const hasIndexCssString = content.indexOf(`<link href="${CDN_URL}/${pageName}/index.css" rel="stylesheet" />`) !== -1;
        const hasAutoCssComment = autoCssReg.test(content);
        if (hasAutoCssComment && !hasIndexCssString) {
            content = content.replace(autoCssReg, `<link href="${CDN_URL}/${pageName}/index.css" rel="stylesheet" />`);
        }

        return content;
    }
};