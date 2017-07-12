module.exports.parseAttr = (raw) => {
    let attrs = raw.split(' ').join('').split(',').join(' ');

    console.log(attrs);

    return attrs;
};