const Data = require('./data.js');

module.exports.parseAttr = (raw) => {

    let attrs = Data.cleanData(raw).split(',').join(' ');

    attrs = ' ' + attrs;

    return attrs;
};