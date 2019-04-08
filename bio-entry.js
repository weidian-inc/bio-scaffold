
/**
 * @file bio scaffold entry file
 */

require('bio-helper')(process)((context) => {
    const ctx = {
        userFolder: context.userDir,
        srcFolder: context.srcDir,
        buildFolder: context.distDir,
        currentEnv: context.taskName,
        debugPort: context.port
    };

    const { userFolder, srcFolder, buildFolder, currentEnv, debugPort } = ctx;

    require('colors');
    switch (currentEnv) {
        case 'dev':
        case 'dev-daily':
        case 'dev-pre':
        case 'dev-prod':
        case 'dev-daily-locally':
        case 'dev-pre-locally':
        case 'dev-prod-locally':
        case 'build':
        case 'build-daily':
        case 'build-pre':
        case 'build-prod':
            break;
        default:
            console.log(`task ${currentEnv} is not supported. Task supported list:\n\n${[
                '-  dev                        本地 - 调试 - 前后端分离的项目',
                '-  dev-daily                  日常 - 调试 - 前后端分离的项目',
                '-  dev-pre                    预发 - 调试 - 前后端分离的项目',
                '-  dev-prod                   线上 - 调试 - 前后端分离的项目',
                '',
                '-  build                      日常 - 打包',
                '-  build-daily                日常 - 打包',
                '-  build-pre                  预发 - 打包',
                '-  build-prod                 线上 - 打包',
            ].join('\n')}\n`);
            process.exit(1);
            return;
    }

    if (currentEnv === 'dev') {
        currentEnv = 'dev-daily';
    }
    if (currentEnv === 'build') {
        currentEnv = 'build-daily';
    }

    if (/dev/.test(currentEnv)) {
        require('./handler/webpack.dev')({ userFolder, srcFolder, buildFolder, currentEnv, debugPort });
    }

    if (/build/.test(currentEnv)) {
        require('./handler/webpack.prod')({ userFolder, srcFolder, buildFolder, currentEnv });
    }
});
