const Expressions = require('./expressions.js');
const Constants = require('./constants.js');

let chain = valueChain = '';
let inVar = inAssignment = false;
let localVars = {};

module.exports.handle = (htmlChain, options, inAttr, nextChar='', mixinParameters=[]) => {
    inVar = !inVar;
    let parsedHTML = '';

    if(!inVar) {
        if(nextChar == Constants.varAssignmentChar) {
            inAssignment = true;
            return '';
        }
        for(let i = 0; i < mixinParameters.length; i++) {
            if(mixinParameters[i] == chain) {
                parsedHTML = chain;
                chain = '';
                return `${Constants.varChar}${parsedHTML}${Constants.varChar}\n`;
            }
        }
        for(variable in localVars) {
            if(localVars.hasOwnProperty(variable)) {
                if(variable == chain) {
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
                                parsedHTML += `${Expressions.getTabs() + '    '}<li>${item}</li>\n`;
                            });
                        } else {
                            parsedHTML += `${Expressions.getTabs() + '    '}${localVars[variable]}\n`;
                        }
                    } else {
                        Expressions.setAttr(Expressions.getAttr() + '"' + localVars[variable] + '"');
                    }
                }
            }
        }
        for(key in options.vars) {
            if(options.vars.hasOwnProperty(key)) {
                if(key == chain) {
                    if(!inAttr) {
                        let inList = false;

                        for(let i = 0; i < Constants.lists.length; i++) {
                            if(Constants.lists[i] == htmlChain[htmlChain.length - 1]) {
                                inList = true;
                                break;
                            }
                        }
                        
                        if(inList && Array.isArray(options.vars[key])) {
                            options.vars[key].forEach((item) => {
                                parsedHTML += `${Expressions.getTabs() + '    '}<li>${item}</li>\n`;
                            });
                        } else {
                            parsedHTML += `${Expressions.getTabs() + '    '}${options.vars[key]}\n`;
                        }
                    } else {
                        Expressions.setAttr(Expressions.getAttr() + '"' + options.vars[key] + '"');
                    }
                }
            }
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

module.exports.getInVar = _  => {return inVar;};
module.exports.getInAssignment = _ => { return inAssignment; };

module.exports.reset = () => {
    chain = valueChain = '';
    inVar = inAssignment = false;
    localVars = {};
};