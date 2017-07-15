const Constants = require('./constants.js');
const fs = require('fs');
const path = require('path');

function cleanData(raw) {
    let data = raw.toString().split('\r\n');

    let inString = inComment = false;
    data = data.join('');

    for(let i = 0; i < data.length; i++) {
        if(data[i] == '\'' || data[i] == '"') {
            inString = !inString;
        } else if(data[i] == Constants.commentChar) {
            inComment = !inComment;
        } else if(data[i] == ' ') {
            if(!inString && !inComment) {
                data = data.substr(0, i) + data.substr(i + 1);
                i--;
            }
        }
    }

    return data;
}

function searchForStrings(data) {
    let stringPositions = [];
    let inString = false;
    let stringCount = 0;

    for(let i = 0; i < data.length; i++) {
        if(data[i] == '\'' || data[i] == '"') {
            inString = !inString;

            if(inString) {
                stringPositions.push([i]);
            } else {
                stringPositions[stringCount].push(i);

                stringCount++;
            }
        }
    }

    return stringPositions;
}

module.exports.getData = (raw, dirPath) => {
    let data = raw.toString().split('\r\n');
    doctype = '';

    if(data[0] == 'doctype') {
        doctype += '<!DOCTYPE html>\n';
        data.splice(0, 1);
    }

    let inString = inComment = false;
    data = data.join('');

    let stringPositions = [];
    let stringCount = 0;

    for(let i = 0; i < data.length; i++) {
        if(data[i] == '\'' || data[i] == '"') {
            inString = !inString;

            if(inString) {
                stringPositions.push([i]);
            } else {
                stringPositions[stringCount].push(i);

                stringCount++;
            }
        } else if(data[i] == Constants.commentChar) {
            inComment = !inComment;
        } else if(data[i] == ' ') {
            if(!inString && !inComment) {
                data = data.substr(0, i) + data.substr(i + 1);
                i--;
            }
        }
    }

    let indexesToClean = [];
    while(data.indexOf(Constants.importKeyword) != -1) {
        let startIndex = data.indexOf(Constants.importKeyword);

        let inString = false;

        for(let i = 0; i < stringPositions.length; i++) {
            if(startIndex > stringPositions[i][0] && startIndex < stringPositions[i][1]) {
                inString = true;
                break;
            }
        }

        if(inString) {
            data = data.slice(0, startIndex + 2) + '0' + data.slice(startIndex + 2, data.length);
            indexesToClean.push(startIndex + 2);
            continue;
        }

        let endIndex = null;
        let importFile = '';

        for(let i = startIndex + Constants.importKeyword.length; i < data.length; i++) {
            if(data[i] == ';') {
                endIndex = i;
                break;
            }
            importFile += data[i];
        }

        let statement = data.slice(startIndex, endIndex + 1);

        let file = fs.readFileSync(path.join(dirPath, importFile));

        data = data.replace(statement, cleanData(file.toString()));
        stringPositions = searchForStrings(data);
    }

    indexesToClean.forEach((index) => {
        data = data.replace(data[index], '');
    });
    
    return [data, doctype];
};

module.exports.importFile = (path) => {
    let file = fs.readFileSync(path);

    return file.toString();
};