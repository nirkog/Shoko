module.exports.selfClosingElements = ['img', 'br', 'i', 'area', 'base', 'col', 'comman', 'embed', 'hr', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
module.exports.lists = ['ul', 'ol'];

module.exports.expressionOpeningChar = '{';
module.exports.expressionClosingChar = '}';
module.exports.expressionSelfClosingChar = ';';

module.exports.attrOpeningChar = '[';
module.exports.attrClosingChar = ']';

module.exports.varChar = '@';
module.exports.varAssignmentChar = '=';
module.exports.endOfVarAssignmentChar = ';';

module.exports.commentChar = '#';

module.exports.mixinChar = '+';
module.exports.mixinKeyword = 'mixin';
module.exports.mixinParameterOpeningChar = '(';
module.exports.mixinParameterClosingChar = ')';

module.exports.importKeyword = 'import';

module.exports.escapeChar = '\\';

module.exports.keywords = ['if', 'switch', 'case', 'else', 'else if'];

module.exports.tab = '    ';

module.exports.doctypeKeyword = 'doctype';
module.exports.doctypes = {
    html: '<!DOCTYPE html>',
    strict: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">',
    transitional: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">',
    frameset: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" "http://www.w3.org/TR/html4/frameset.dtd">',
    xml: '<?xml version="1.0" encoding="utf-8" ?>',
    1.1: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
    strict1: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
    transitional1: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
    frameset1: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">'
};