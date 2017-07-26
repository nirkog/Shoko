const Expressions = require('./expressions');
const Constants = require('./constants');

let chain = '';
let inComment = hidden = false;

module.exports.handle = () => {
    if(!inComment && Expressions.getExpression() != '') {
        Expressions.setExpression(Expressions.getExpression() + Constants.commentChar);
        return '';
    }

    let parsedHTML = '';

    inComment = !inComment;

    if(!inComment && !hidden) {
        parsedHTML += `${Expressions.getTabs() + Constants.tab}<!--${chain}-->\n`;
    }

    chain = '';
    hidden = false;

    return parsedHTML;
};

module.exports.inComment = () => { return inComment; };

module.exports.addToChain = (char) => {
    chain += char;
    if(chain.length == 1 && char == Constants.hiddenCommentChar) {
        hidden = true;
    } 
};

module.exports.reset = () => {
    chain = '';
    inComment = hidden = false;
};