const Expressions = require('./expressions.js');

let chain = '';
let inVar = false;

module.exports.handle = (options, inAttr) => {
    inVar = !inVar;
    let parsedHTML = '';

    if(!inVar) {
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