const Constants = require('./constants');
const Statements = require('./statements');
const Data = require('./data');

let chain = [];
let attr = expression = '';
const selfClosingElements = Constants.selfClosingElements;
let inAttr = false;

function parseAttr(raw) {
    let attrs = Data.cleanData(raw).split(',').join(' ');
    
    attrs = ' ' + attrs;
    
    return attrs;
}

function getTabs() {
    let tabs = '';
    for(let i = 1; i < chain.length; i++) {
        tabs += Constants.tab;
    }
    return tabs;
}

function shorthandProperties() {
    if(expression.indexOf('.') != -1 || expression.indexOf('#') != -1) {
        let startIndex;
        if(expression.indexOf('.') == -1) {
            startIndex = expression.indexOf('#');
        } else if(expression.indexOf('#') == -1) {
            startIndex = expression.indexOf('.');
        } else {
            startIndex = expression.indexOf('.') > expression.indexOf('#') ? expression.indexOf('#') : expression.indexOf('.'); 
        }

        let properties = expression.slice(startIndex, expression.length);
        let tag = expression.slice(0, startIndex);
        let inClass = inID = false;
        let classes = [];
        let id = '';
        let currentPorperty = '';

        if(tag == '') {
            tag = Constants.defaultShorthandElement;
        }

        for(let i = 0; i < properties.length; i++) {
            let char = properties[i];

            if(char == '.') {
                if(!inClass) {
                    if(currentPorperty != '') {
                        if(id != '')
                            throw new Error('multipule ids');

                        id = currentPorperty;
                        currentPorperty = '';
                    }

                    inClass = true;
                    inID = false;
                } else {
                    if(currentPorperty != '') {
                        classes.push(currentPorperty);
                        currentPorperty = '';
                    }
                }
            } else if(char == '#') {
                if(!inID) {
                    if(currentPorperty != '') {
                        classes.push(currentPorperty);
                        currentPorperty = '';
                    }

                    inID = true;
                    inClass = false;
                } else {
                    if(currentPorperty != '') {
                        if(id != '')
                            throw new Error('multipule ids');

                        id = currentPorperty;
                        currentPorperty = '';
                    }
                }
            } else if(inClass || inID) {
                if(char != ' ')
                    currentPorperty += char;
            }
        }

        if(inID) {
            if(id != '')
                throw new Error('multipule ids');
            id = currentPorperty;
        } else if(inClass) {
            classes.push(currentPorperty);
        }

        let element = {classes: classes, id: id, tag: tag};

        return element;
    } else {
        return null;
    }
}

module.exports.getTabs = getTabs;

module.exports.handleOpeningChar = options => {
    if(Statements.checkForForInLoop(expression, options) || Statements.checkForIfStatement(expression, options)) {
        attr = '';
        expression = '';

        return '';
    }

    let element = shorthandProperties();

    chain.push(element ? element.tag : expression);

    attr = parseAttr(attr);
    let tabs = getTabs();
    let parsedHTML = tabs;

    if(selfClosingElements.indexOf(expression) >= 0) {
        const space = attr == ' ' ? '' : ' ';
        if(!element) {
            parsedHTML += `<${expression}${attr}${space}/>\n`;
        } else {
            if(element.id != '')
                attr += ` id="${element.id}"`;
            
            if(element.classes.length > 0) {
                attr += ' class="';
                element.classes.forEach((className) => {
                    let spaceAfter = element.classes.indexOf(className) == element.classes.length - 1 ? '' : ' ';
                    attr += className + spaceAfter;
                });
                attr += '"';
            }

            parsedHTML += `<${element.tag}${attr}${space}/>\n`;
        }
    } else {
        attr = attr == ' ' ? '' : attr;
        if(!element) {
            parsedHTML += `<${expression}${attr}>\n`;
        } else {
            if(element.id != '')
                attr += ` id="${element.id}"`;
            
            if(element.classes.length > 0) {
                attr += ' class="';
                element.classes.forEach((className) => {
                    let spaceAfter = element.classes.indexOf(className) == element.classes.length - 1 ? '' : ' ';
                    attr += className + spaceAfter;
                });
                attr += '"';
            }
            
            parsedHTML += `<${element.tag}${attr}>\n`;
        }
    }

    attr = '';
    expression = '';

    return parsedHTML;
};

module.exports.handleClosingChar = _ => {
    let parsedHTML = getTabs();

    if(selfClosingElements.indexOf(chain[chain.length - 1]) >= 0) {
        chain.pop();
    } else {
        parsedHTML += `</${chain.pop()}>\n`;
    }

    return parsedHTML;
};

module.exports.handleSelfClosingExpression = _ => {
    attr = parseAttr(attr);
    let parsedHTML = getTabs() + Constants.tab;

    if(selfClosingElements.indexOf(expression) >= 0) {
        const space = attr == '' ? '' : ' ';
        parsedHTML += `<${expression}${attr}${space}/>\n`;
    } else {
        throw Error(`${expression} is not a self closing tag.`);
    }

    expression = '';
    attr = '';

    return parsedHTML;
};

module.exports.handleOpeningAttr = _ => {
    if(!Statements.quickIfStatementCheck(expression))
        inAttr = true;
    else
        expression += Constants.attrOpeningChar;
};

module.exports.handleClosingAtrr = _ => {
    if(inAttr)
        inAttr = false;
    else
        expression += Constants.attrClosingChar;
};

module.exports.setAttr = (a) => {attr = a};

module.exports.getAttr = _ => {
    return attr;
};

module.exports.getChain = _ => { return chain; };

module.exports.setExpression = (e) => expression = e;

module.exports.addToExpression = (toAdd) => {
    expression += toAdd;
};

module.exports.getExpression = _ => {
    return expression;
};

module.exports.inAttr = _ => { return inAttr; };

module.exports.reset = () => {
    chain = [];
    attr = expression = '';
    inAttr = false;
};