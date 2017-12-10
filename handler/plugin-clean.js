
const fs = require('fs');
const fse = require('fs-extra');

function Clean({ distDir }) {
    if (fs.existsSync(distDir)) {
        try {
            fse.removeSync(distDir);
        } catch (err) {
            throw Error(err);
        }
    }
}

Clean.prototype.apply = () => {};

module.exports = Clean;
