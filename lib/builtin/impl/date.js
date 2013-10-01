/**
 * @fileOverview The builtin Date object.
 */
define(['exports',
        'atum/compute',
        'atum/builtin/date',
        'atum/builtin/func',
        'atum/builtin/object',
        'atum/builtin/meta/date',
        'atum/builtin/meta/builtin_constructor',
        'atum/builtin/meta/func',
        'atum/builtin/meta/object',
        'atum/builtin/operations/builtin_function',
        'atum/operations/func',
        'atum/operations/number',
        'atum/operations/string',
        'atum/operations/object',
        'atum/operations/type_conversion',
        'atum/operations/value_reference',
        'atum/value/property'],
function(exports,
        compute,
        date_ref,
        func_builtin,
        builtin_object,
        meta_date,
        meta_builtin_constructor,
        meta_func,
        meta_object,
        func_builtin,
        func,
        number,
        string,
        object,
        type_conversion,
        value_reference,
        property){
//"use strict";

/* Date
 ******************************************************************************/
/**
 * `Date(...)`
 */
var DateCall = function(ref, thisObj, args) {
    return func.call(
        compute.just(date_ref.DatePrototypeValueOf),
        object.construct(date_ref.Date, []),
        compute.enumeration());
};

/**
 * `new Date(...)`.
 */
DateConstruct = function(ref, args) {
    if (args.length === 0)
        return compute.bind(compute.getNow, function(now) {
            return value_reference.create(new DateInstance(now));
        });
};

/**
 * `Date`
 */
var Date = new meta_builtin_constructor.BuiltinConstructor(
    func_builtin.FunctionPrototype, {
        'isDate': {
            'value': date_ref.DateIsDate
        }
    },
    DateCall,
    DateConstruct);


/* DateInstance
 ******************************************************************************/
var DateInstance = function(primitiveValue) {
    meta_date.Date.call(this, this.proto, this.properties, primitiveValue);
};
DateInstance.prototype = new meta_date.Date;
DateInstance.prototype.constructor = DateInstance; 

DateInstance.prototype.proto = date_ref.DatePrototype;

DateInstance.prototype.properties = {};

/* DatePrototype
 ******************************************************************************/
/**
 * `Date.prototype`
 */
var DatePrototype = new meta_object.Object(builtin_object.ObjectPrototype, {
    'constructor': property.createValuePropertyFlags(
        date_ref.Date,
        property.WRITABLE | property.CONFIGURABLE),
    'getTime': property.createValuePropertyFlags(
        date_ref.DatePrototypeGetTime,
        property.WRITABLE | property.CONFIGURABLE),
    'valueOf': property.createValuePropertyFlags(
        date_ref.DatePrototypeValueOf,
        property.WRITABLE | property.CONFIGURABLE),
});

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
        func.createConstructor('Date', 0, date_ref.DatePrototype, date_ref.Date.setValue(Date)),
        
        date_ref.DatePrototype.setValue(DatePrototype),
        func_builtin.create(date_ref.DatePrototypeGetTime, 'getTime', 0, DatePrototypeGetTime),
        func_builtin.create(date_ref.DatePrototypeValueOf, 'valueOf', 0, DatePrototypeValueOf));
};

var configure = function(mutableBinding, immutableBinding) {
    return compute.sequence(
        mutableBinding('Date', date_ref.Date));
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