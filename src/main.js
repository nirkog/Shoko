const fs = require('fs');
const path = require('path');
const colors = require('colors');

const Data = require('./data.js');
const Attr = require('./attr.js');
const Constants = require('./constants.js');
const Strings = require('./strings.js');
const Expressions = require('./expressions.js');
const Vars = require('./vars.js');
const Comments = require('./comments.js');
const Mixin = require('./mixin.js');

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
            const selfClosingElements = Constants.selfClosingElements;

            const combinedDataParsed = Data.getData(raw, testPath);
            let data = combinedDataParsed[0];
            parsedHTML += combinedDataParsed[1];

            for(let i = 0; i < data.length; i++) {
                let char = data[i];

                if(char == Constants.expressionOpeningChar) {
                    if(!Mixin.checkForMixin(Expressions.getExpression())) {
                        if(Mixin.inMixin()) {
                            Mixin.addToParsedMixin(Expressions.handleOpeningChar());
                            Mixin.addToChainLength(1);
                        } else {
                            parsedHTML += Expressions.handleOpeningChar();
                        }
                    }
                } else if(char == Constants.expressionClosingChar) {
                    if(!Mixin.inMixin()) {
                        parsedHTML += Expressions.handleClosingChar();
                    } else {
                        Mixin.addToChainLength(-1);

                        if(Mixin.getExpressionChainLength() < 0)
                            Mixin.createMixin();
                        else
                            Mixin.addToParsedMixin(Expressions.handleClosingChar());
                    }
                } else if(char == Constants.expressionSelfClosingChar) {
                    if(Mixin.inMixin())
                        Mixin.addToParsedMixin(Expressions.handleSelfClosingExpression());
                    else
                        parsedHTML += Expressions.handleSelfClosingExpression();
                } else if((char == '\'' || char == '"') && !Expressions.inAttr() && !Comments.inComment()) {
                    if(Mixin.inMixin())
                        Mixin.addToParsedMixin(Strings.handle());
                    else if(Mixin.inMixinCall())
                        Mixin.addToCallChain(Strings.handle());
                    else
                        parsedHTML += Strings.handle();
                } else if(Strings.inString()) {
                    Strings.addToChain(char);
                } else if(char == Constants.varChar) {
                    if(Mixin.inMixin())
                        Mixin.addToParsedMixin(Vars.handle(Expressions.getChain(), options, Expressions.inAttr(), Mixin.getParameters()));
                    else
                        parsedHTML += Vars.handle(Expressions.getChain(), options, Expressions.inAttr());
                } else if(Vars.getInVar()) {
                    Vars.addToChain(char);
                } else if(char == Constants.attrOpeningChar) {
                    Expressions.handleOpeningAttr();
                } else if(char == Constants.attrClosingChar) {
                    Expressions.handleClosingAtrr();
                } else if(Expressions.inAttr()) {
                    Expressions.setAttr(Expressions.getAttr() + char);
                } else if(char == Constants.commentChar) {
                    if(Mixin.inMixin())
                        Mixin.addToParsedMixin(Comments.handle());
                    else
                        parsedHTML += Comments.handle();
                } else if(Comments.inComment()) {
                    Comments.addToChain(char);
                } else if(char == Constants.mixinChar) {
                    if(!Mixin.inMixinCall()) {
                        Mixin.startMixinCall();
                    } else {
                        parsedHTML += Mixin.endMixinCall();
                    }
                } else if(Mixin.inMixinCall()) {
                    Mixin.addToCallChain(char);
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

function reset() {
    Comments.reset();
    Expressions.reset();
    Mixin.reset();
    Strings.reset();
    Vars.reset();
}

function parseMyFile() {
    parse(path.join(testPath, inputFileName), 
    {
        vars: {list: ['name', 'age']}
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
                console.log('Updating file'.rainbow);
                reset();
                parseMyFile();
                oldFile = newFile;
            }
        });
    }
    , 500);
}).catch((err) => {
    console.log(err);
});