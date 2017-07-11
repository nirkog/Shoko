module.exports.parseAttr = (raw) => {
    let attrs = raw.split(' ').join('').split(',').join(' ');

    return attrs;
};