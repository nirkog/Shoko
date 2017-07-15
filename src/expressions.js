const Constants = require('./constants.js');
const Attr = require('./Attr.js');

let chain = [];
let attr = expression = '';
const selfClosingElements = Constants.selfClosingElements;
let inAttr = false;

module.exports.handleOpeningChar = _ => {
    chain.push(expression);
    let parsedHTML = '';

    if(selfClosingElements.indexOf(expression) >= 0) {
        parsedHTML += `<${expression}${attr} />\n`;
    } else if(expression == Constants.importKeyword) {

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

module.exports.handleSelfClosingExpression = _ => {
    let parsedHTML = '';

    if(selfClosingElements.indexOf(expression) >= 0) {
        parsedHTML += `<${expression}${attr}/>\n`;
    } else {
        throw Error(`Rim ERROR - ${expression} is not a self closing tag.`);
    }

    expression = '';

    return parsedHTML;
};

module.exports.handleOpeningAttr = _ => {
    inAttr = true;
};

module.exports.handleClosingAtrr = _ => {
    inAttr = false;

    attr = ' ' + Attr.parseAttr(attr);
};

module.exports.setAttr = (a) => attr = a;

module.exports.getAttr = _ => {
    return attr;
};

module.exports.getChain = _ => { return chain; };

module.exports.setExpression = (e) => expression = e;

module.exports.getExpression = _ => {
    return expression;
};

module.exports.inAttr = _ => { return inAttr; };

module.exports.reset = () => {
    chain = [];
    attr = expression = '';
    inAttr = false;
};