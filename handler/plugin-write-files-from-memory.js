function WriteFilesFromMemory(callback) {
    this.callback = callback;
};

/**
 * @param {object} compiler
 */
WriteFilesFromMemory.prototype.apply = function (compiler) {
    const path = require('path');
    const fs = require('fs');
    const fse = require('fs-extra');

    compiler.plugin('done', function () {
        const staticDir = compiler.outputPath;
        const arr = compiler.outputFileSystem.readdirSync(staticDir);

        arr.forEach((filename) => {
            const stats = compiler.outputFileSystem.statSync(path.join(staticDir, filename));
            if (stats.isDirectory()) {
                const targetFile = path.join(staticDir, filename, 'index.js');

                if (compiler.outputFileSystem.existsSync(targetFile)) {
                    const content = compiler.outputFileSystem.readFileSync(targetFile, 'utf-8');

                    fse.ensureFileSync(targetFile);
                    fs.writeFileSync(targetFile, content);
                }
            } else if (stats.isFile() && filename === 'common.js') {
                const targetFile = path.join(staticDir, filename);
                const content = compiler.outputFileSystem.readFileSync(targetFile, 'utf-8');

                fse.ensureFileSync(targetFile);
                fs.writeFileSync(targetFile, content);
            }
        })
    });
};

module.exports = WriteFilesFromMemory;

