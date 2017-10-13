const Expressions = require('./expressions');
const Constants = require('./constants');

let chain = '';
let inComment = hidden = false;

module.exports.getPositions = (data, stringPositions) => {
    let dataIndex = 0, inComment = false, positions = [], count = 0;
    for(let c of data) {
        if(c == Constants.commentChar) {
            let inString = false;
            stringPositions.forEach((position) => {
                if(dataIndex > position[0] && dataIndex < position[1])
                    inString = true;
            });

            if(inString) continue;

            if(!inComment) {
                positions.push([dataIndex]);
            } else {
                positions[count].push(dataIndex);
                count++;
            }

            inComment = !inComment;
        }
        dataIndex++;
    }

    return positions;
};

module.exports.handle = () => {
    if(Expressions.inAttr()) {
        Expressions.setAttr(Expressions.getAttr() + Constants.commentChar);
    } else if(!inComment && Expressions.getExpression() != '') {
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