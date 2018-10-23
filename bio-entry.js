
/**
 * @file bio scaffold entry file
 */

require('bio-helper')(process)((context) => {
    require('colors');
    switch (context.taskName) {
        case 'dev-daily':
        case 'dev-pre':
        case 'dev-prod':
        case 'build-daily':
        case 'build-pre':
        case 'build-prod':
            break;
        default:
            console.log(`task "${context.taskName}" (via "bio run ${context.taskName}") is not supported. Task supported list:\n\n${[
                '-  dev-daily                  dev daily',
                '-  dev-pre                    dev pre',
                '-  dev-prod                   dev prod',
                '',
                '-  build-daily                build daily',
                '-  build-pre                  build pre',
                '-  build-prod                 build prod',
            ].join('\n')}\n`);
            return;
    }

    if (/dev-/.test(context.taskName)) {
        require('./handler/webpack.dev')(context);
    }

    if (/build-/.test(context.taskName)) {
        require('./handler/webpack.prod')(context);
    }
});
