const fs = require('fs');
const path = require('path');
const Data = require('./data.js');
const Attr = require('./attr.js');
const Constants = require('./constants.js');
const Strings = require('./Strings.js');

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
            let parsedHTML = stringChain = varChain = expression = attr = '';
            let chain = [];
            let inString = inVar = inAttr = false;
            const selfClosingElements = Constants.selfClosingElements;

            const combinedDataParsed = Data.getData(raw);
            let data = combinedDataParsed[0];
            parsedHTML += combinedDataParsed[1];

            for(let i = 0; i < data.length; i++) {
                let char = data[i];

                if(char == Constants.expressionOpeningChar) {
                    chain.push(expression);

                    if(selfClosingElements.indexOf(expression) >= 0) {
                        parsedHTML += `<${expression}${attr} />\n`
                    } else {
                        parsedHTML += `<${expression}${attr}>\n`;
                    }
                    attr = '';
                    expression = '';
                } else if(char == Constants.expressionClosingChar) {
                    if(selfClosingElements.indexOf(chain[chain.length - 1]) >= 0) {
                        chain.pop();
                    } else {
                        parsedHTML += `</${chain.pop()}>\n`;
                    }
                } else if(char == '\'' || char == '"' && !inAttr) {
                    inString = !inString;

                    parsedHTML = Strings.handleQuoteChar(inString, parsedHTML);
                    stringChain = '';
                } else if(inString) {
                    stringChain += char;
                } else if(char == Constants.varChar) {
                    inVar = !inVar;

                    if(!inVar) {
                        for(key in options.vars) {
                            if(options.vars.hasOwnProperty(key)) {
                                if(key == varChain) {
                                    parsedHTML += `${options.vars[key]}\n`;
                                }
                            }
                        }
                        varChain = '';
                    } else {
                    }
                } else if(inVar) {
                    varChain += char; 
                } else if(char == Constants.attrOpeningChar) {
                    inAttr = true;
                } else if(char == Constants.attrClosingChar) {
                    inAttr = false;

                    attr = ' ' + Attr.parseAttr(attr);
                } else if(inAttr) {
                    attr += char;
                } else {
                    expression += char;                    
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