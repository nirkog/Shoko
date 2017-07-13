let chain = '';
let inComment = false;

module.exports.handle = () => {
    let parsedHTML = '';

    inComment = !inComment;

    if(!inComment) {
        parsedHTML += `<!--${chain}-->\n`;
    }

    chain = '';

    return parsedHTML;
};

module.exports.inComment = () => { return inComment; };

module.exports.addToChain = (char) => chain += char;

module.exports.reset = () => {
    chain = '';
    inComment = false;
};