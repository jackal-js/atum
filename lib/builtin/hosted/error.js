/**
 * @fileOverview Error builtins defined in the hosted language.
 */
"use strict";

/**
 * `isNaN`
 */
Object.defineProperty(Error.prototype, 'toString', {
    'value': function(x) {
        var o = this;
        if (!(o instanceof Object))
            throw TypeError();
        
        var name = o.name;
        if (name === undefined)
            name = "Error";
        else
            name = name + "";
        
        var msg = o.message;
        if (msg === undefined)
            msg = "";
        else
            msg = msg + "";
        
        if (name === "")
            return msg;
        else if (msg === "")
            return name;
        else
            return name + ": " + msg;
    },
    'enumerable': false,
    'configurable': true,
    'writable': true
});
