/**
 * @fileOverview Builtin function meta
 */
define(['exports',
        'amulet/record',
        'atum/builtin/meta/func'],
function(exports,
        record,
        meta_func){
"use strict";

/* BuiltinFunction
 ******************************************************************************/
/**
 * Meta object for a function included in the hosted language as a builtin.
 */
var BuiltinFunction = record.declare(new meta_func.Function, [
    'proto',
    'properties',
    'id',
    'impl'],
    function(proto, props, id, impl) {
        meta_func.Function.call(this, proto, props);
        this.id = id;
        this.impl = impl;
        this.call = (impl ? impl.bind(this) : null);
    });

/* Export
 ******************************************************************************/
exports.BuiltinFunction = BuiltinFunction;

});