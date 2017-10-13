const Expressions = require('./expressions');
const Constants = require('./constants');
const Mixin = require('./mixin');

let chain = currentStringChar = '';
let inString = escaped = false;

function cleanCommentStrings(data, positions) {
    for(let position of positions) {
        let beforeCount = afterCount = 0;

        for(let i = 0; i < position[0]; i++) {
            if(data[i] == Constants.commentChar) beforeCount++;
        }

        for(let i = position[1] + 1; i < data.length; i++) {
            if(data[i] == Constants.commentChar) afterCount++;
        }

        if(!(beforeCount % 2 == 0 && afterCount % 2 == 0)) {
            positions.splice(positions.indexOf(position), 1);
        }
    }

    return positions;
}

module.exports.getPositions = (data) => {
    let stringChar = null, positions = [], count = 0, dataIndex = 0;
    for(let c of data) {
        if(stringChar == null) {
            if(c == "'" || c == '"') {
                stringChar = c;

                positions.push([dataIndex]);
            }
        } else {
            if(c == stringChar && data[dataIndex - 1] != '\\') {
                stringChar = null;

                positions[count].push(dataIndex);
                count++;
            }
        }
        dataIndex++;
    }

    positions = cleanCommentStrings(data, positions);

    return positions;
};

module.exports.handle = (char) => {
    let parsedHTML = '';
    inString = !inString;

    if(!inString) {

        if(Expressions.getExpression() != '') {
            Expressions.addToExpression("'" + chain + "'");
            chain = '';
            return '';
        }

        if(currentStringChar == char) {
            let tabs = Mixin.inMixinCall() ? '' : Expressions.getTabs() + Constants.tab;
            parsedHTML += `${tabs}${chain}\n`;
        } else {
            inString = !inString;
            chain += char;

            return '';
        }
    } else {
        currentStringChar = char;
    }

    chain = '';

    return parsedHTML;
};

module.exports.setEscaped = (e) => escaped = e;
module.exports.isEscaped = _ => { return escaped; };

module.exports.inString = _ => { return inString; };

module.exports.addToChain = (char) => chain += char;

module.exports.getChain = _ => { return chain; };

module.exports.reset = () => {
    chain = currentStringChar = '';
    inString = escaped = false;
};