const Constants = require('./constants.js');
const Expressions = require('./expressions.js');

let mixins = {};
let inMixin = inCall = false;
let currentMixin, callChain = parsedMixin = '';
let currentParameters = [];
let expressionChainLength = 0;

module.exports.checkForMixin = (input) => {
    if(input.substr(0, Constants.mixinKeyword.length) == Constants.mixinKeyword) {
        inMixin = true;

        if(input.indexOf(Constants.mixinParameterOpeningChar) != -1 && input.indexOf(Constants.mixinParameterClosingChar) != -1) {
            let parametersRaw = input.slice(input.indexOf(Constants.mixinParameterOpeningChar) + 1, input.indexOf(Constants.mixinParameterClosingChar));
            currentParameters = parametersRaw.split(',');

            currentMixin = input.slice(Constants.mixinKeyword.length, input.indexOf(Constants.mixinParameterOpeningChar));
        } else {
            currentMixin = input.substr(Constants.mixinKeyword.length, input.length);
        }
        Expressions.setExpression('');

        for(mixin in mixins) {
            if(mixins.hasOwnProperty(mixin)) {
                if(mixin == currentMixin) {
                    throw new Error('\'' + currentMixin + '\' mixin already exists');
                }
            }
        }

        return true;
    }

    return false;
};

module.exports.createMixin = () => {
    inMixin = false;

    mixins[currentMixin] = {
        mixin: parsedMixin,
        parameters: currentParameters
    };

    currentMixin = parsedMixin = '';
};

module.exports.startMixinCall = _ => inCall = true;

module.exports.endMixinCall = _ => {
    let parameters = parsed = null;
    if(callChain.indexOf(Constants.mixinParameterOpeningChar) != -1 && callChain.indexOf(Constants.mixinParameterClosingChar) != -1) {
        parameters = callChain.slice(callChain.indexOf(Constants.mixinParameterOpeningChar) + 1, callChain.indexOf(Constants.mixinParameterClosingChar));
        parameters = parameters.split('\r\n').join('').split(',');
        
        callChain = callChain.slice(0, callChain.indexOf(Constants.mixinParameterOpeningChar));
    }

    let found = false;
    for(mixin in mixins) {
        if(mixins.hasOwnProperty(mixin)) {
            if(callChain == mixin) {
                found = true;
                break;
            }
        }
    }

    if(!found)
        throw new Error('mixin \'' + callChain + '\' does not exist');

    if(parameters) {
        if(parameters.length != mixins[mixin].parameters.length)
            throw new Error(`Expected ${mixins[mixin].parameters.length} arguments, got ${parameters.length}.`);

        parsed = mixins[mixin].mixin;

        for(let i = 0; i < parameters.length; i++) {
            parsed = parsed.replace(
                `${Constants.varChar}${mixins[mixin].parameters[i]}${Constants.varChar}`,
                parameters[i]
            );
        }
    }

    inCall = false;
    callChain = '';
    
    if(parsed) 
        return parsed;

    return mixins[mixin].mixin;
};

module.exports.addToCallChain = (char) => callChain += char;
module.exports.addToParsedMixin = (char) => {parsedMixin += char;};
module.exports.addToChainLength = (c) => expressionChainLength += c;

module.exports.inMixin = _ => { return inMixin; };
module.exports.inMixinCall = _ => { return inCall; };

module.exports.getExpressionChainLength = _ => { return expressionChainLength; };
module.exports.getParameters = _ => { return currentParameters; };

module.exports.reset = () => {
    mixins = {};
    inMixin = inCall = false;
    currentMixin = callChain = parsedMixin = '';
    parameters = [];
};