
const fs = require('fs');
const fse = require('fs-extra');

function Clean({ buildFolder }) {
    if (fs.existsSync(buildFolder)) {
        try {
            fse.removeSync(buildFolder);
        } catch(err) {
            throw Error(err);
        }
        
    }
}

Clean.prototype.apply = () => {};

module.exports = Clean;
