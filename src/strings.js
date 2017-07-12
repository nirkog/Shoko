let chain = '';
let inString = false;

module.exports.handle = _ => {
    let parsedHTML = '';
    inString = !inString;

    if(!inString) {
        parsedHTML += `${chain}\r\n`;
    }

    chain = '';

    return parsedHTML;
};

module.exports.inString = _ => { return inString; };

module.exports.addToChain = (char) => chain += char;