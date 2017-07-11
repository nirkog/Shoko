const Constants = require('./constants.js');
let chain = [];
let attr = expression = '';
const selfClosingElements = Constants.selfClosingElements;

module.exports.handleOpeningChar = _ => {
    chain.push(expression);
    let parsedHTML = '';

    if(selfClosingElements.indexOf(expression) >= 0) {
        parsedHTML += `<${expression}${attr} />\n`
    } else {
        parsedHTML += `<${expression}${attr}>\n`;
    }

    attr = '';
    expression = '';

    return parsedHTML;
};

module.exports.handleClosingChar = _ => {
    let parsedHTML = '';

    if(selfClosingElements.indexOf(chain[chain.length - 1]) >= 0) {
        chain.pop();
    } else {
        parsedHTML += `</${chain.pop()}>\n`;
    }

    return parsedHTML;
};

module.exports.setAttr = (a) => attr = a;

module.exports.getAttr = _ => {
    return attr
};

module.exports.setExpression = (e) => expression = e;

module.exports.getExpression = _ => {
    return expression;
};