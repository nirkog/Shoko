const Constants = require('./constants');

let iterator, iteratedArray;
let parsedContent = '';
let inForInLoop = false;
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

module.exports.checkForForInLoop = (expression, options) => {
    if(expression.slice(0, Constants.forInKeywords[0].length) == Constants.forInKeywords[0]) {
        if(expression[Constants.forInKeywords[0].length] == Constants.parentheses[0]) {
            if(expression.indexOf(Constants.parentheses[1]) == expression.length - 1) {
                let statement = expression.slice(Constants.forInKeywords[0].length + 1, expression.length - 1);
                let parts = statement.split(' ');
                
                iteratedArray = findVar(parts[2].slice(1, parts[2].length - 1), options);
                iterator = parts[0];

                inForInLoop = true;

                if(!iteratedArray)
                    throw new Error(`${iteratedArray} is not an array.`);
                else if(!Array.isArray(iteratedArray))
                    throw new Error(`${iteratedArray} is not an array.`);

                return true;
            } else {
                throw new Error('missing )');
            }
        }
    }

    return false;
};

function endLoop(options) {
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

module.exports.reset = () => {
    iterator = '';
    iteratedArray = [];
    inForInLoop = false;
    parsedContent = '';
    chainLength = 0;
};

module.exports.iterator = iterator;
module.exports.iteratedArray = iteratedArray;
module.exports.inForInLoop = _ => inForInLoop;
module.exports.addToContent = (c) => parsedContent += c;
module.exports.checkIfOver = _ => {
    return chainLength == -1;
};
module.exports.incrementChainLength = _ => chainLength++;
module.exports.decrementChainLength = _ => chainLength--;
module.exports.endLoop = endLoop;