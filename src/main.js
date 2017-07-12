const fs = require('fs');
const path = require('path');
const Data = require('./data.js');
const Attr = require('./attr.js');
const Constants = require('./constants.js');
const Strings = require('./strings.js');
const Expressions = require('./expressions.js');
const Vars = require('./vars.js');
const Comments = require('./comments.js');

const testPath = path.join(__dirname, '../tests/');
const inputFileName = 'test.rim';
const outputFileName = 'test.html';

function getFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if(err)
                return reject(err);
            
            resolve(data);
        });
    });
}

function parse(path, options) {
    return new Promise((resolve, reject) => {
        getFile(path)
        .then((raw) => {
            let parsedHTML = '';
            let chain = [];
            const selfClosingElements = Constants.selfClosingElements;

            const combinedDataParsed = Data.getData(raw);
            let data = combinedDataParsed[0];
            parsedHTML += combinedDataParsed[1];

            for(let i = 0; i < data.length; i++) {
                let char = data[i];

                if(char == Constants.expressionOpeningChar) {
                    parsedHTML += Expressions.handleOpeningChar();
                } else if(char == Constants.expressionClosingChar) {
                    parsedHTML += Expressions.handleClosingChar();
                } else if(char == Constants.expressionSelfClosingChar) {
                    parsedHTML += Expressions.handleSelfClosingExpression();
                } else if((char == '\'' || char == '"') && !Expressions.inAttr() && !Comments.inComment()) {
                    parsedHTML += Strings.handle();
                } else if(Strings.inString()) {
                    Strings.addToChain(char);
                } else if(char == Constants.varChar) {
                    parsedHTML += Vars.handle(options, Expressions.inAttr());
                } else if(Vars.getInVar()) {
                    Vars.addToChain(char);
                } else if(char == Constants.attrOpeningChar) {
                    Expressions.handleOpeningAttr();
                } else if(char == Constants.attrClosingChar) {
                    Expressions.handleClosingAtrr();
                } else if(Expressions.inAttr()) {
                    Expressions.setAttr(Expressions.getAttr() + char);
                } else if(char == Constants.commentChar) {
                    parsedHTML += Comments.handle();
                } else if(Comments.inComment()) {
                    Comments.addToChain(char);
                } else {
                    Expressions.setExpression(Expressions.getExpression() + char);             
                }
            }
            
            resolve(parsedHTML);
        })
        .catch((err) => {
            reject(err);
        });
    });
}

function parseMyFile() {
    parse(path.join(testPath, inputFileName), 
    {
        vars: {message: 'WELCOME BATOOCCHII!'}
    })
    .then((data, err) => {
        if(err)
            console.log(err);
        else
            return data;
    })
    .then((data) => {
        fs.writeFile(path.join(testPath, outputFileName), data);
    })
    .catch((err) => {
        console.log(err);
    });
}

getFile(path.join(testPath, inputFileName))
.then((data, err) => {
    if(err)
        throw new Error(err);

    parseMyFile();

    let oldFile = data;
    setInterval(() => {
        getFile(path.join(testPath, inputFileName)).then((data, err) => {
            let newFile = data;
            if(newFile.toString() != oldFile.toString()) {
                console.log('File changed');
                parseMyFile();
                oldFile = newFile;
            }
        });
    }
    , 2500);
}).catch((err) => {
    console.log(err);
});