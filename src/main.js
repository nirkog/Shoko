const fs = require('fs');
const path = require('path');
const Data = require('./data.js');
const Attr = require('./attr.js');
const Constants = require('./constants.js');
const Strings = require('./Strings.js');
const Expressions = require('./Expressions.js');
const Vars = require('./Vars.js');

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
            let inString = inAttr = false;
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
                } else if(char == '\'' || char == '"' && !inAttr) {
                    inString = !inString;

                    parsedHTML += Strings.handleQuoteChar(inString, parsedHTML);
                } else if(inString) {
                    Strings.addToChain(char);
                } else if(char == Constants.varChar) {
                    parsedHTML += Vars.handle(options, inAttr);
                } else if(Vars.getInVar()) {
                    Vars.addToChain(char);
                } else if(char == Constants.attrOpeningChar) {
                    inAttr = true;
                } else if(char == Constants.attrClosingChar) {
                    inAttr = false;

                    Expressions.setAttr(' ' + Attr.parseAttr(Expressions.getAttr()));
                } else if(inAttr) {
                    Expressions.setAttr(Expressions.getAttr() + char);
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
    parse(path.join(__dirname, 'test.rim'), 
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
        fs.writeFile(path.join(__dirname, 'test.html'), data);
    })
    .catch((err) => {
        console.log(err);
    });
}

getFile(path.join(__dirname, 'test.rim'))
.then((data, err) => {
    if(err)
        throw new Error(err);

    parseMyFile();

    let oldFile = data;
    setInterval(() => {
        getFile(path.join(__dirname, 'test.rim')).then((data, err) => {
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