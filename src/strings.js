const Expressions = require('./expressions.js');
const Constants = require('./constants');
const Mixin = require('./mixin');

let chain = '';
let inString = escaped = false;

module.exports.handle = _ => {
    let parsedHTML = '';
    inString = !inString;

    if(!inString) {
        let tabs = Mixin.inMixinCall() ? '' : Expressions.getTabs() + Constants.tab;
        parsedHTML += `${tabs}${chain}\r\n`;
    }

    chain = '';

    return parsedHTML;
};

module.exports.setEscaped = (e) => escaped = e;
module.exports.isEscaped = _ => { return escaped; };

module.exports.inString = _ => { return inString; };

module.exports.addToChain = (char) => chain += char;

module.exports.getChain = _ => { return chain; };

module.exports.reset = () => {
    chain = '';
    inString = escaped = false;
};