const assert = require('chai').assert;
const shoko = require('./../../index');

const vars = {
    blankH1: 'Hello World!',
    stringVar: 'John',
    argumentMixin: 13,
    basicComment: 'This is a great comment.'
};


const expectedResults = {
    blankPage: `<!DOCTYPE html><html><head><title></title></head><body></body></html>`,
    h1Var: `<h1>${vars.blankH1}</h1>`,
    stringVar: `<h2>Hello, ${vars.stringVar}!</h2>`,
    basicMixin: '<p>Hello World</p>',
    argumentMixin: `<div>I am ${vars.argumentMixin}</div>`,
    basicComment: `<!--${vars.basicComment}-->`,
    varDecleration: 'hi',
    shorthandClassesAndIds: '<div id="blue" class="red"></div>',
    shorthandSelfClosing: '<link href="main.css" rel="stylesheet" />'
};

const tests = {
    blankPage: 'doctype html;html {head {title {}} body {}}',
    h1Var: `h1 {@variable@}`,
    stringVar: `h2 {'Hello, @name@!'}`,
    basicMixin: `mixin mix {p{'Hello World'}} +mix+`,
    argumentMixin: `mixin printAge(age){div {'I am @age@'}} +printAge(${vars.argumentMixin})+`,
    basicComment: `*${vars.basicComment}*`,
    varDecleration: '@var@ = hi; @var@',
    shorthandClassesAndIds: '.red#blue {}',
    shorthandSelfClosing: 'link[href="main.css", rel="stylesheet"];'
};

function cleanRender(input, options={}, defaultDoctype=true) {
    return shoko.render(input, options, defaultDoctype).split('    ').join('').split('\n\r').join('').split('\n').join('');
}

describe('Main Rendering', () => {
    it('Should return an empty html5 page (Basic test).', () => {
       assert.equal(cleanRender(tests.blankPage), expectedResults.blankPage); 
    });

    it(`Should return an h1 saying ${vars.blankH1} (Vars test).`, () => {
        assert.equal(cleanRender(tests.h1Var, {variable: vars.blankH1}, false), expectedResults.h1Var);
    });

    it(`Should return an h2 saying Hello, ${vars.stringVar}! (String vars test).`, () => {
        assert.equal(cleanRender(tests.stringVar, {name: vars.stringVar}, false), expectedResults.stringVar);
    });

    it('Sould return a p tag with Hello World (Basic mixins test).', () => {
        assert.equal(cleanRender(tests.basicMixin, {}, false), expectedResults.basicMixin);
    });

    it('Should return a div that says I am 13 (Parameter mixin + String Vars test).', () => {
        assert.equal(cleanRender(tests.argumentMixin, {}, false), expectedResults.argumentMixin);
    });

    it(`Should return a comment saying ${vars.basicComment} (Basic comment test).`, () => {
        assert.equal(cleanRender(tests.basicComment, {}, false), expectedResults.basicComment);
    });

    it('Should return h1 with hi (Var decleration test).', () => {
        assert.equal(cleanRender(tests.varDecleration, {}, false), expectedResults.varDecleration);
    });

    it('Should return two identical results (Reset test).', () => {
        const first = shoko.render(tests.blankPage);
        const second = shoko.render(tests.blankPage);
        assert.equal(first, second);
    });

    it('Should return a div with a class of red an an id of blue (Shorthand classes and ids test).', () => {
        assert.equal(cleanRender(tests.shorthandClassesAndIds, {}, false), expectedResults.shorthandClassesAndIds);
    });

    it('Should return a link to the css file main.css (Shorthand self-closing tags test).', () => {
        assert.equal(cleanRender(tests.shorthandSelfClosing, {}, false), expectedResults.shorthandSelfClosing);
    })
});

describe('File Rendering', () => {

});