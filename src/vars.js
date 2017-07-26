const Expressions = require('./expressions.js');
const Constants = require('./constants.js');
const Strings = require('./strings');
const Mixin = require('./mixin');

let chain = valueChain = '';
let inVar = inAssignment = false;
let localVars = {};

module.exports.handle = (htmlChain, options, inAttr, nextChar='') => {
    inVar = !inVar;
    let parsedHTML = '';
    let found = '';
    
    if(!inVar) {
        if(nextChar == Constants.varAssignmentChar) {
            inAssignment = true;
            return '';
        }
        if(Mixin.inMixin()) {
            mixinParameters = Mixin.getParameters();
            for(let i = 0; i < mixinParameters.length; i++) {
                if(mixinParameters[i] == chain) {
                    found = true;
                    parsedHTML = chain;
                    chain = '';
                    return `${Expressions.getTabs() + Constants.tab}${Constants.varChar}${parsedHTML}${Constants.varChar}\n`;
                }
            }
        }
        for(variable in localVars) {
            if(localVars.hasOwnProperty(variable)) {
                if(variable == chain) {
                    found = true;

                    if(!inAttr) {
                        let inList = false;

                        for(let i = 0; i < Constants.lists.length; i++) {
                            if(Constants.lists[i] == htmlChain[htmlChain.length - 1]) {
                                inList = true;
                                break;
                            }
                        }
                        
                        if(inList && Array.isArray(localVars[variable])) {
                            localVars[variable].forEach((item) => {
                                parsedHTML += `<li>${item}</li>\n`;
                            });
                        } else {
                            parsedHTML += `${localVars[variable]}`;
                        }

                        return parsedHTML;
                    } else {
                        Expressions.setAttr(Expressions.getAttr() + localVars[variable]);
                    }
                }
            }
        }
        for(key in options) {
            if(options.hasOwnProperty(key)) {
                if(key == chain) {
                    found = true;
                    if(!inAttr) {
                        let inList = false;

                        for(let i = 0; i < Constants.lists.length; i++) {
                            if(Constants.lists[i] == htmlChain[htmlChain.length - 1]) {
                                inList = true;
                                break;
                            }
                        }
                        
                        let tabs = Strings.inString() ? '' : Expressions.getTabs() + '    ';
                        let newLine = Strings.inString() ? '' : '\n';
                        if(inList && Array.isArray(options[key])) {
                            options[key].forEach((item) => {
                                parsedHTML += `${tabs}<li>${item}</li>${newLine}`;
                            });
                        } else {
                            parsedHTML += `${tabs}${options[key]}${newLine}`;
                        }
                    } else {
                        Expressions.setAttr(Expressions.getAttr() + '"' + options[key] + '"');
                    }
                }
            }
        }
        
        if(!found) {
            throw new Error(chain + ' is undefined.');
        }

        chain = '';
    }
    
    return parsedHTML;
};

module.exports.endAssignment = () => {
    valueChain = valueChain.slice(1, valueChain.length);

    /*if(!isNaN(parseFloat(valueChain)) && isFinite(valueChain))
        valueChain = parseInt(valueChain);*/

    localVars[chain] = valueChain;

    chain = valueChain = '';
    inAssignment = false;
};

module.exports.addToChain = (char) => chain += char;
module.exports.addToValueChain = (char) => valueChain += char;

module.exports.inVar = _  => {return inVar;};
module.exports.inAssignment = _ => { return inAssignment; };

module.exports.setInVar = (v) => inVar = v;

module.exports.reset = () => {
    chain = valueChain = '';
    inVar = inAssignment = false;
    localVars = {};
};