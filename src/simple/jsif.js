
var jsif = (typeof window === 'undefined' ? global.jsif : {});

var require = require;

if (!require) {
    require = () => {};
}

var exports = exports;

if (!exports) {
    exports = {};
}

jsif.createVerb = function() {
    var verb = {};
    verb.patterns = [];
    return verb;
};

exports.createVerb = jsif.createVerb;
