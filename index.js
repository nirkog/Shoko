const fs = require('fs');
const path = require('path');
const colors = require('colors');

const Data = require('./src/data');
const Attr = require('./src/attr');
const Constants = require('./src/constants');
const Strings = require('./src/strings');
const Expressions = require('./src/expressions');
const Vars = require('./src/vars');
const Comments = require('./src/comments');
const Mixin = require('./src/mixin');

function render(input, options={}) {
    let parsedHTML = '';
    const selfClosingElements = Constants.selfClosingElements;

    const combinedDataParsed = Data.getData(input, __dirname);
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
            } else {
                Expressions.setExpression('');
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
            if(Constants.expressionSelfClosingChar == Constants.endOfVarAssignmentChar && Vars.inAssignment()) {
                Vars.endAssignment();
                continue;
            }

            if(Mixin.inMixin())
                Mixin.addToParsedMixin(Expressions.handleSelfClosingExpression());
            else
                parsedHTML += Expressions.handleSelfClosingExpression();
        } else if((char == '\'' || char == '"') && !Expressions.inAttr() && !Comments.inComment()) {
            if(Vars.inVar()) {
                throw new Error('var names cannot include strings');
            }

            if(Mixin.inMixin()) {
                Mixin.addToParsedMixin(Strings.handle());
            } else if(Mixin.inMixinCall()) {
                Mixin.addToCallChain(Strings.handle());
            } else {
                if(Strings.inString() && Strings.isEscaped()) {
                    Strings.addToChain(char); 
                    Strings.setEscaped(false);
                } else {
                    parsedHTML += Strings.handle();
                }
            }
        } else if(Strings.inString()) {
            if(char == Constants.varChar) {
                if(Strings.isEscaped()) {
                    Strings.addToChain(char);
                    Vars.setInVar(!Vars.inVar());

                    if(!Vars.inVar()) {
                        Strings.setEscaped(false);
                    }
                } else {
                    Strings.addToChain(Vars.handle(Expressions.getChain(), options, Expressions.inAttr()));
                }
            } else if(Vars.inVar()) {
                if(Strings.isEscaped())
                    Strings.addToChain(char);
                else
                    Vars.addToChain(char);
            } else if(char == Constants.escapeChar) {
                Strings.setEscaped(true);
            } else {
                Strings.addToChain(char);
            }
        } else if(char == Constants.varChar) {
            if(Mixin.inMixin()) {
                if(i == data.length - 1)
                    Mixin.addToParsedMixin(Vars.handle(Expressions.getChain(), options, Expressions.inAttr(), ''));
                else
                    Mixin.addToParsedMixin(Vars.handle(Expressions.getChain(), options, Expressions.inAttr(), data[i + 1]));
            }
            else if(Mixin.inMixinCall()) {
                Mixin.addToCallChain(Vars.handle(Expressions.getChain(), options, Expressions.inAttr(), ''));
            }
            else {
                if(i == data.length - 1)
                    parsedHTML += Vars.handle(Expressions.getChain(), options, Expressions.inAttr());
                else
                    parsedHTML += Vars.handle(Expressions.getChain(), options, Expressions.inAttr(), data[i + 1], []);
            }
        } else if(Vars.inVar()) {
            if(char == Constants.endOfVarAssignmentChar) {
                Vars.endAssignment();
            } else {
                Vars.addToChain(char);
            }
        } else if(Vars.inAssignment()) {
            Vars.addToValueChain(char);
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

    reset();

    return parsedHTML;
}

function reset() {
    Comments.reset();
    Expressions.reset();
    Mixin.reset();
    Strings.reset();
    Vars.reset();
}

function renderFile(filePath, options, fn) {
    fs.readFile(filePath, (err, data) => {
        if(err)
            throw new Error(err);

        let result = render(data.toString(), options);
        
        fn(result, err);
    });
}

//console.log(renderFile(path.join(__dirname, '../test/test.rim'), {vars: {name: 'Nir'}}, (res, d) => {console.log(res);}));

module.exports.render = render;
module.exports.renderFile = renderFile;