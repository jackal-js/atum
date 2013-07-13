/**
 * @fileOverview
 */
define(['exports',
        'atum/value/object',
        'atum/builtin/meta/func'],
function(exports,
        object,
        meta_func){
"use strict";

/* BuiltinFunction
 ******************************************************************************/
/**
 * Meta object for a function included in the hosted language as a builtin.
 */
var BuiltinFunction = function(proto, props, id, impl) {
    meta_func.FunctionPrototype.call(this, proto, props);
    this.id = id;
    this.impl = impl;
};
BuiltinFunction.prototype = new meta_func.FunctionPrototype;

BuiltinFunction.prototype.call = function(/*...*/) {
    return this.impl.apply(this, arguments);
};

/* Export
 ******************************************************************************/
exports.BuiltinFunction = BuiltinFunction;

});