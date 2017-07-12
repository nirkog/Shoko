const Constants = require('./constants.js');

module.exports.getData = (raw) => {
    let data = raw.toString().split('\r\n');
    doctype = '';

    if(data[0] == 'doctype') {
        doctype += '<!DOCTYPE html>\n';
        data.splice(0, 1);
    }

    let inString = inComment = false;
    data = data.join('');

    for(let i = 0; i < data.length; i++) {
        if(data[i] == '\'' || data[i] == '"') {
            inString = !inString;
        } else if(data[i] == Constants.commentChar) {
            inComment = !inComment;
        } else if(data[i] == ' ') {
            if(!inString && !inComment) {
                data = data.substr(0, i) + data.substr(i + 1);
                i--;
            }
        }
    }

    return [data, doctype];
};