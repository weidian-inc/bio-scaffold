module.exports = (targetObj, srcObj) => {
    Object.keys(srcObj).forEach(key => {
        targetObj[key] = srcObj[key];
    });

    return targetObj;
};
