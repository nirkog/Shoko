const Constants = require('./constants');
const Vars = require('./vars');
const Expressions = require('./expressions');
const isNumber = require('is-number');

let iterator, iteratedArray;
let parsedContent = '';
let inForInLoop = inIfStatement = ifCondition = inStatement = inElse = false;
let chainLength = 0;

module.exports.checkForForStatements = (data) => {
    let positions = [];
    let inFor = false;
    let startIndex;

    for(let i = 0; i < data.length; i++) {
        let char = data[i];
        if(char == Constants.parentheses[0]) {
            if(i >= Constants.forInKeywords[0].length) {
                if(data.slice(i - 3, i) == Constants.forInKeywords[0]) {
                    startIndex = i - 3;
                    inFor = true;
                }
            }
        } else if(char == Constants.parentheses[1] && inFor) {
            if(i != data.length - 1 && data[i + 1] != Constants.mixinChar) {
                positions.push([startIndex, i + 1]);
            }
        }
    }

    return positions;
};

module.exports.quickIfStatementCheck = (expression) => {
    if(expression.slice(0, Constants.ifKeyword.length) == Constants.ifKeyword)
        if(expression[Constants.ifKeyword.length] == Constants.parentheses[0])
            return true;

    return false;
}

function parseSide(side, options) {
    if(side[0] == Constants.varChar && side[side.length - 1] == Constants.varChar) {
        let variable = findVar(side.slice(1, side.length - 1), options);
        if(variable != null) {
            return variable;
        } else {
            variable = Vars.searchVarInLocalVars(side.slice(1, side.length - 1));

            if(variable != null)
                return variable;
            else
                throw new Error(`Couldn't find variable ${side.slice(1, side.length - 1)}`);   
        }
    } else {
        switch(side) {
            case 'null':
                return null;
                break;
            case 'true':
                return true;
                break;
            case 'false':
                return false;
                break;
        }

        if(isNumber(side)) {
            return Number.parseFloat(side);
        } else if((side[0] == '\'' && side[side.length - 1] == '\'') || (side[0] == '"' && side[side.length - 1] == '"')) {
            return side.slice(1, side.length - 1);
        } else if(side[0] == Constants.attrOpeningChar && side[side.length - 1] == Constants.attrClosingChar) {
            let elements = side.slice(1, side.length - 1).split(',');

            for(let element of elements) {
                if((element[0] == "'" && element[element.length - 1] == "'") || (element[0] == '"' && element[element.length - 1] == '"')) {
                    elements[elements.indexOf(element)] = element.slice(1, element.length - 1);
                } else if(isNumber(element)) {
                    elements[elements.indexOf(element)] = Number.parseFloat(element);
                } else {
                    throw new Error(`${element} is undefined`);
                }
            }

            return elements;
        } else {
            throw new Error(`${side} is undefined`);
        }
    }
}

function compareArrays(arr1, arr2) {
    if(arr1.length == arr2.length) {
        for(let i = 0; i < arr1.length; i++) {
            if(arr1[i] != arr2[i])
                return false;
        }

        return true;
    }

    return false;
}

module.exports.checkForIfStatement = (expression, options) => {
    if(expression.slice(0, Constants.ifKeyword.length) == Constants.ifKeyword) {
        if(expression[Constants.ifKeyword.length] == Constants.parentheses[0] && expression[expression.length - 1] == Constants.parentheses[1]) {
            let condition = expression.slice(Constants.ifKeyword.length + 1, expression.length - 1);
            let operator = null;
            let sides = [];
            
            ifCondition = false;
            inIfStatement = true;
            inStatement = true;

           /*  for(let op of Constants.logicOperators) {
                if(condition.indexOf(op) != -1) {

                }
            } */
            
            for(let op of Constants.ifOperators) {
                if(condition.indexOf(op) != -1) {
                    operator = op;
                    break;
                }
            }

            if(!operator) {
                sides.push(parseSide(condition, options));

                if(sides[0] != false && sides[0] != true) {
                    operator = '!=';
                    sides.push(null);
                } else {
                    operator = '==';
                    sides.push(true);
                }
            } else {
                sides.push(parseSide(condition.slice(0, condition.indexOf(operator)), options));
                sides.push(parseSide(condition.slice(condition.indexOf(operator) + operator.length, condition.length), options));
            }

            switch(operator) {
                case '==':
                    if(sides[0] == sides[1]) 
                        ifCondition = true;
                    else if(Array.isArray(sides[0]) && Array.isArray(sides[1])) {
                        if(compareArrays(sides[0], sides[1]))
                            ifCondition = true;
                    }
                    break;
                case '!=':
                    if(Array.isArray(sides[0]) && Array.isArray(sides[1])) {
                        if(!compareArrays(sides[0], sides[1]))
                            ifCondition = true;
                    }
                    else if(sides[0] != sides[1])
                        ifCondition = true;
                    break;
                case '===':
                    if(sides[0] === sides[1])
                        ifCondition = true;
                    else if(Array.isArray(sides[0]) && Array.isArray(sides[1])) {
                        if(compareArrays(sides[0], sides[1]))
                            ifCondition = true;
                    }
                    break;
                case '>':
                    if(sides[0] > sides[1])
                        ifCondition = true;
                    break;
                case '<':
                    if(sides[0] < sides[1])
                        ifCondition = true;
                    break;
                case '>=':
                    if(sides[0] >= sides[1])
                        ifCondition = true;
                    break;
                case '<=':
                    if(sides[0] <= sides[1])
                        ifCondition = true;
                    break;
            }

            return true;
        }
    }

    return false;
}

module.exports.enterElseStatement = () => {
    inElse = true;
    inIfStatement = false;
    chainLength = 0;
    parsedContent = '';


};

function findVar(name, options) {
    for(let key in options) {
        if(options.hasOwnProperty(key)) {
            if(key == name) {
                return options[key];
            }
        }
    }

    return null;
}

function parseArray(array) {
    let result = [];
    
    array = array.slice(0, array.length);
    array = array.split(' ').join('').split(',');
    
    array.forEach((item) => {
        result.push(item);
    });

    return result;
}

module.exports.checkForForInLoop = (expression, options) => {
    if(expression.slice(0, Constants.forInKeywords[0].length) == Constants.forInKeywords[0]) {
        if(expression[Constants.forInKeywords[0].length] == Constants.parentheses[0]) {
            if(expression.indexOf(Constants.parentheses[1]) == expression.length - 1) {
                let statement = expression.slice(Constants.forInKeywords[0].length + 1, expression.length - 1);
                let parts = statement.split(' ');
                
                iteratedArray = findVar(parts[2].slice(1, parts[2].length - 1), options);
                iterator = parts[0];

                inForInLoop = true;
                inStatement = true;

                if(!iteratedArray) {
                    iteratedArray = parseArray(Expressions.getAttr());

                    if(!iteratedArray)
                        throw new Error(`${iteratedArray} is not an array.`);
                } else if(!Array.isArray(iteratedArray))
                    throw new Error(`${iteratedArray} is not an array.`);

                return true;
            } else {
                throw new Error('missing )');
            }
        }
    }

    return false;
};

function endForInLoop(options) {
    let parsedHTML = '';

    iteratedArray.forEach((item) => {
        let parsed = '';
        let inVar = false;
        let varChain = '';
        for(let i = 0; i < parsedContent.length; i++) {
            let char = parsedContent[i];

            if(char == Constants.varChar) {
                inVar = !inVar;

                if(!inVar) {
                    if(varChain === iterator) {
                        parsed += item;
                    } else {
                        for(key in options) {
                            if(options.hasOwnProperty(key)) {
                                if(key == varChain) {
                                    parsed += options[key];
                                }
                            }
                        }

                        let localVar = Vars.searchVarInLocalVars(varChain);
                        if(localVar)
                            parsed += localVar; 
                    }
                }
            } else if(inVar) {
                varChain += char;
            } else {
                parsed += char;
            }
        }

        parsedHTML += parsed;
    });

    module.exports.reset();

    return parsedHTML;
}

function endIfStatement() {
    let parsedHTML = '';

    if(ifCondition)
        parsedHTML = parsedContent;

    //module.exports.reset();

    return parsedHTML;
}

function endElseStatement() {
    let parsedHTML = '';

    if(!ifCondition)
        parsedHTML = parsedContent;

    module.exports.reset();

    return parsedHTML;
}

module.exports.reset = () => {
    iterator = '';
    iteratedArray = [];
    inForInLoop = inStatement = inIfStatement = ifCondition = false;
    parsedContent = '';
    chainLength = 0;
};

module.exports.inForInLoop = () => inForInLoop;
module.exports.inIfStatement = () => inIfStatement;
module.exports.inStatement = () => inStatement;

module.exports.addToContent = (c) => parsedContent += c;

module.exports.checkIfOver = () => {
    return chainLength == -1;
};

module.exports.incrementChainLength = () => chainLength++;
module.exports.decrementChainLength = () => chainLength--;

module.exports.endStatement = (options) => {
    if(inForInLoop)
        return endForInLoop(options);
    else if(inIfStatement)
        return endIfStatement();
    else if(inElse)
        return endElseStatement();
};