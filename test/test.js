const assert = require('chai').assert;
const rim = require('./../src/index.js');

const basicTemplate = 'doctype\r\n head { title { "This is a title" } } body { h1 { "This is a basic template" } }';
const basicMarkup = `<!DOCTYPE html>
<head>
    <title>
        This is a title
    </title>
</head>
<body>
    <h1>
        This is a basic template
    </h1>
</body>`;

describe('Rendering', () => {
    it('should return a string', () => {
        let result = rim.render(basicTemplate);
        assert.typeOf(result, 'string');
    });

    it('should return basic markup correct', () => {
        let result = rim.render(basicTemplate);
        assert.equal(result, basicMarkup);
    });
});