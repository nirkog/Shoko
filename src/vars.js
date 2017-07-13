const Expressions = require('./expressions.js');
const Constants = require('./constants.js');

let chain = '';
let inVar = false;

module.exports.handle = (options, inAttr, mixinParameters=[]) => {
    inVar = !inVar;
    let parsedHTML = '';

    if(!inVar) {
        for(let i = 0; i < mixinParameters.length; i++) {
            if(mixinParameters[i] == chain) {
                parsedHTML = chain;
                chain = '';
                return `${Constants.varChar}${parsedHTML}${Constants.varChar}\n`;
            }
        }
        for(key in options.vars) {
            if(options.vars.hasOwnProperty(key)) {
                if(key == chain) {
                    if(!inAttr) {
                        parsedHTML += `${options.vars[key]}\n`;
                    } else {
                        Expressions.setAttr(Expressions.getAttr() + options.vars[key]);
                    }
                }
            }
        }

        chain = '';
    }
    
    return parsedHTML;
};

module.exports.addToChain = (char) => chain += char;

module.exports.getInVar = _  => {
    return inVar;
};

module.exports.reset = () => {
    chain = '';
    inVar = false;
};