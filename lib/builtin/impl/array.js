/**
 * @fileOverview The builtin Array object.
 */
define(['exports',
        'atum/compute',
        'atum/builtin/array',
        'atum/builtin/func',
        'atum/builtin/object',
        'atum/builtin/meta/array',
        'atum/builtin/meta/builtin_constructor',
        'atum/builtin/meta/func',
        'atum/builtin/meta/object',
        'atum/operations/boolean',
        'atum/operations/number',
        'atum/operations/string',
        'atum/operations/object',
        'atum/operations/type_conversion',
        'atum/operations/value_reference',
        'atum/value/args',
        'atum/value/type_conversion',
        'atum/value/value'],
function(exports,
        compute,
        array_ref,
        builtin_func,
        builtin_object,
        meta_array,
        meta_builtin_constructor,
        meta_func,
        meta_object,
        boolean,
        number,
        string,
        object,
        type_conversion,
        value_reference,
        value_args,
        value_type_conversion,
        value){
//"use strict";

/* Array
 ******************************************************************************/
/**
 * Hosted `Array` constructor.
 */
var Array = function() {
    meta_builtin_constructor.BuiltinConstructor.call(
        this,
        this.proto,
        this.properties,
        this.call,
        this.construct);
};
Array.prototype = new meta_builtin_constructor.BuiltinConstructor;
Array.prototype.constructor = Array;

Array.prototype.proto = builtin_func.FunctionPrototype;

Array.prototype.properties = {
    'prototype': {
        'value': array_ref.ArrayPrototype
    },
    'isArray': {
        'value': array_ref.ArrayIsArray
    }
};

/**
 * 
 */
Array.prototype.call = function(ref, thisObj, args) {
    return this.construct(ref, args);
};

/**
 * Builtin Array constructor.
 */
Array.prototype.construct = function(ref, args) {
    if (args.length === 1) {
        var lenArg = args.getArg(0);
        if (value.isNumber(lenArg)) {
            var len = value_type_conversion.toUint32(lenArg);
            if (len.value !== lenArg.value)
                return error.rangeError();
            
            return object.defineProperty(
                value_reference.create(new ArrayInstance()),
                'length', {
                    'value': compute.just(len),
                    'writable': true,
                    'enumerable': false,
                    'configurable': false
                });
        }
    }
    
    return args.reduce(function(p, c, i) {
        return object.defineProperty(
            p,
            i + "", {
                'value': compute.just(c),
                'writable': true,
                'enumerable': true,
                'configurable': true
            });
    }, object.construct(compute.just(ref), compute.enumeration(number.create(args.length))));
};

/**
 * `Array.isArray(arg)`
 * 
 * Is `arg` an array object.
 */
var arrayIsArray = function(ref, thisObj, args) {
    if (args.length === 0)
        return boolean.FALSE;
    
    var arg = args.getArg(0);
    return compute.bind(
        value_reference.getValue(compute.just(arg)),
        function(arg) {
            return boolean.create(arg.cls === ArrayPrototype.prototype.cls);
        });
};

/* ArrayInstance
 ******************************************************************************/
var ArrayInstance = function() {
    meta_array.Array.call(this, this.proto, this.properties);
};
ArrayInstance.prototype = new meta_array.Array;
ArrayInstance.prototype.constructor = ArrayInstance; 

ArrayInstance.prototype.proto = array_ref.ArrayPrototype;

ArrayInstance.prototype.properties = {};

/* ArrayPrototype
 ******************************************************************************/
var ArrayPrototype = function() {
    meta_object.Object.call(this, this.proto, this.properties);
};
ArrayPrototype.prototype = new meta_object.Object;
ArrayPrototype.prototype.constructor = ArrayPrototype; 

ArrayPrototype.prototype.proto = builtin_object.ObjectPrototype;

ArrayPrototype.prototype.properties = {
    'constructor': {
        'value': array_ref.Array
    }
};

/* Initialization
 ******************************************************************************/
var initialize = function() {
    var builtin_function = require('atum/builtin/builtin_function');
    return compute.sequence(
        array_ref.Array.setValue(new Array()),
        builtin_function.create(array_ref.ArrayIsArray, 'isArray', 1, arrayIsArray),
        
        array_ref.ArrayPrototype.setValue(new ArrayPrototype()));
};

/* Export
 ******************************************************************************/
exports.initialize = initialize;

exports.Array = array_ref.Array;
exports.ArrayPrototype = array_ref.ArrayPrototype;

});