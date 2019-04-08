module.exports = {
    log(content) {
        console.log(`${'[bio scaffold]'.green} ${content}`);
    },
    warn(content) {
        console.log(`${'[bio scaffold]'.yellow} ${content}`);
    },
    error(content) {
        console.log(`${'[bio scaffold]'.red} ${content}`);
    }
};