const Constants = require('./Constants');
const Vars = require('./vars');

let inForLoop = false, parsedContent = '', scopeBalance = 0;
let iterator, iteratedVar, iteratedVarValue = null;

function inString(startIndex, stringPositions) {
    let inString = false;
    for(let position of stringPositions) {
        if(position[0] < startIndex && position[1] > startIndex) {
            return true;
        }
    }

    return false;
}

function findForLoops(data, stringPositions) {
    let positions = [], removedCharacters = 0;

    while(data.indexOf(Constants.forInKeywords[0]) != -1) {
        let startIndex = data.indexOf(Constants.forInKeywords[0]);

        if(inString(startIndex, stringPositions)) continue;

        if(data[startIndex + Constants.forInKeywords[0].length] == Constants.parentheses[0]) {
            const slicedData = data.slice(startIndex, data.length);
            let endIndex = startIndex + slicedData.indexOf(Constants.parentheses[1]);

            positions.push([startIndex + removedCharacters, endIndex + removedCharacters]);
            data = data.slice(0, startIndex) + data.slice(endIndex + 1, data.length);

            removedCharacters += endIndex - startIndex;
        } else {
            data = data.slice(0, startIndex) + data.slice(startIndex + 3, data.length);
        }
    }

    return positions;
}

function checkForForLoop(data, index, options) {
    if(data.slice(index - Constants.forInKeywords[0].length, index) == Constants.forInKeywords[0]) {
        let fullExpression = data.slice(index - Constants.forInKeywords[0].length, index - Constants.forInKeywords[0].length + data.slice(index - Constants.forInKeywords[0].length, data.length).indexOf(Constants.expressionOpeningChar));
        let shortExpression = fullExpression.slice(Constants.forInKeywords[0].length + 1, fullExpression.length - 1);

        if(shortExpression.indexOf(Constants.forInKeywords[1]) == -1)
            throw new Error('In keyword not found in for in loop.');

        let parts = shortExpression.split(' ');
        iterator = parts[0];
        iteratedVar = parts[2].slice(1, parts[2].length - 1);
        iteratedVarValue = Vars.findVar(iteratedVar, options);

        if(iteratedVarValue == null)
            throw new Error('Iterated variable in for loop is null.');
        else if(!Array.isArray(iteratedVarValue))
            throw new Error('Iterated variable in for loop is not an array.');

        inForLoop = true;
    }
}

function findVar() {
    let regex = new RegExp(`@${iterator}@`, 'g');
    let result = regex.exec(parsedContent);
    
    if(result == null)
        return null;

    let escapedIndexes = [];

    let indexes = [];
    while(result) {
        indexes.push(result.index);
        if(result.index != 0) {
            if(parsedContent[result.index - 1] == '\\') {
                escapedIndexes.push(result.index - 1);
                indexes.pop();
            }
        }
        result = regex.exec(parsedContent);
    }

    for(let i = 0; i < escapedIndexes.length; i++) {
        for(let index of indexes) {
            if(index > escapedIndexes[i]) {
                index--;
            }
        }

        parsedContent = parsedContent.slice(0, escapedIndexes[i]) + parsedContent.slice(escapedIndexes[i] + 1, parsedContent.length);
    }

    console.log(indexes);

    return indexes;
}

function exitForLoop() {
    inForLoop = false;
    let result = '';

    const initIteratorIndexes = findVar();
    let iteratorIndexes = [];

    for(let index of initIteratorIndexes) {
        iteratorIndexes.push(index);
    }

    for(let item of iteratedVarValue) {
        let compiledContent = parsedContent;
        let indexesCount = 0;
        for(let index of iteratorIndexes) {
            compiledContent = compiledContent.slice(0, index) + `${item}` + compiledContent.slice(index + `@${iterator}@`.length, compiledContent.length);

            for(let i = indexesCount + 1; i < iteratorIndexes.length; i++) {
                iteratorIndexes[i] += `${item}`.length - `@${iterator}@`.length;
            }

            indexesCount++;
        }

        result += compiledContent;
        iteratorIndexes = [];
        for(let index of initIteratorIndexes) {
            iteratorIndexes.push(index);
        }
    }
    
    return result;
}

module.exports.findForLoops = findForLoops;
module.exports.checkForForLoop = checkForForLoop;

module.exports.inForLoop = () => inForLoop;
module.exports.addToParsedContent = (content) => parsedContent += content;
module.exports.getIterator = () => iterator;

module.exports.scopeBalance = scopeBalance;
module.exports.exitForLoop = exitForLoop;

module.exports.reset = () => {
    inForLoop = false;
    parsedContent = '';
    scopeBalance = 0;
    iterator = iteratedVar = '';
    iteratedVarValue = null;
};