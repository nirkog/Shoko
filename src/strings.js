let chain = '';

module.exports.handleQuoteChar = (inString) => {
    let parsedHTML = '';

    if(!inString) {
        parsedHTML += `${chain}\r\n`;
    }

    chain = '';

    return parsedHTML;
};

module.exports.addToChain = (char) => chain += char;