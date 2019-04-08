const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

function Create({ entryObj, targetDir }) {
    Object.keys(entryObj).forEach((key) => {
        if (key !== 'vendor') { // 排除 vendor
            const cssFile = path.join(targetDir, `${key}.css`);
            fse.ensureFileSync(cssFile);
            fs.writeFileSync(cssFile, '/* no content at develop mode */');
        }
    });
}

Create.prototype.apply = () => { };

module.exports = Create;
