const fs = require('fs');
const path = require('path');
const isrelative = require('is-relative');

module.exports = ({ userDir, srcDir, distDir, port, webpack, WebpackDevServer }) => {
    let userConfig = {};

    const userConfigFile = path.join(srcDir, 'bio.config.js');
    if (fs.existsSync(userConfigFile)) {
        userConfig = require(userConfigFile)({ userDir, srcDir, distDir, port, webpack, WebpackDevServer });

        // 修正 distDir
        if (userConfig.distDir && isrelative(userConfig.distDir)) {
            userConfig.distDir = path.join(userDir, userConfig.distDir);
        }
    }

    return userConfig;
};
