/**
 * @fileOverview The builtin Date object.
 */
define(['exports',
        'atum/compute',
        'atum/builtin/date',
        'atum/builtin/object',
        'atum/builtin/meta/date',
        'atum/builtin/meta/object',
        'atum/builtin/operations/builtin_constructor',
        'atum/builtin/operations/builtin_function',
        'atum/operations/construct',
        'atum/operations/func',
        'atum/operations/number',
        'atum/operations/string',
        'atum/operations/object',
        'atum/operations/type_conversion',
        'atum/operations/value_reference',
        'atum/value/property'],
function(exports,
        compute,
        date_builtin,
        object_builtin,
        meta_date,
        meta_object,
        builtin_constructor,
        builtin_function,
        construct,
        func,
        number,
        string,
        object,
        type_conversion,
        value_reference,
        property){
"use strict";

/* Date
 ******************************************************************************/
/**
 * `Date(...)`
 */
var DateCall = function(ref, thisObj, args) {
    return compute.bind(
        construct.construct(date_builtin.Date, []),
        function(t) {
            return func.call(date_builtin.DatePrototypeValueOf, t, []);
        });
};

/**
 * `new Date(...)`.
 */
var DateConstruct = function(ref, args) {
    if (args.length === 0)
        return compute.bind(compute.getNow, function(now) {
            return value_reference.create(new DateInstance(now));
        });
};

var DateProperties = {
    'isDate':  property.createValuePropertyFlags(
        date_builtin.DateIsDate),
    
    'prototype': property.createValuePropertyFlags(
        date_builtin.DatePrototype)
};

/* DateInstance
 ******************************************************************************/
var DateInstance = function(primitiveValue) {
    meta_date.Date.call(this, this.proto, this.properties, true, primitiveValue);
};
DateInstance.prototype = new meta_date.Date;
DateInstance.prototype.constructor = DateInstance; 

DateInstance.prototype.proto = date_builtin.DatePrototype;

DateInstance.prototype.properties = {};

/* DatePrototype
 ******************************************************************************/
/**
 * `Date.prototype`
 */
var DatePrototype = new meta_object.Object(
    object_builtin.ObjectPrototype, {
        'constructor': property.createValuePropertyFlags(
            date_builtin.Date),
        
        'getTime': property.createValuePropertyFlags(
            date_builtin.DatePrototypeGetTime,
            property.WRITABLE | property.CONFIGURABLE),
        
        'valueOf': property.createValuePropertyFlags(
            date_builtin.DatePrototypeValueOf,
            property.WRITABLE | property.CONFIGURABLE),
    },
    true);

var DatePrototypeGetTime = function(ref, thisObj, args) {
    return value_reference.dereference(thisObj, function(t) {
        if (!(t instanceof meta_date.Date))
            return error.typeError();
        
        return number.create(t.primitiveValue.getTime());
    });
};


var DatePrototypeValueOf = function(ref, thisObj, args) {
    return value_reference.dereference(thisObj, function(t) {
        if (!(t instanceof meta_date.Date))
            return error.typeError();
        
        return number.create(t.primitiveValue.valueOf());
    });
};

/* Initialization
 ******************************************************************************/
var initialize = function() {
    return compute.sequence(
        builtin_constructor.create(date_builtin.Date, 'Date', 0, DateProperties, DateCall, DateConstruct),
        
        date_builtin.DatePrototype.setValue(DatePrototype),
        builtin_function.create(date_builtin.DatePrototypeGetTime, 'getTime', 0, DatePrototypeGetTime),
        builtin_function.create(date_builtin.DatePrototypeValueOf, 'valueOf', 0, DatePrototypeValueOf));
};

var configure = function(mutableBinding, immutableBinding) {
    return compute.sequence(
        mutableBinding('Date', date_builtin.Date));
};

var execute = function() {
    return compute.empty;
};

/* Export
 ******************************************************************************/
exports.initialize = initialize;
exports.configure = configure;
exports.execute = execute;

});