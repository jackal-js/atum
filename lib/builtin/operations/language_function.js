/**
 * @fileOverview Language function operations.
 */
define(['exports',
        'atum/compute',
        'atum/builtin/func',
        'atum/builtin/object',
        'atum/builtin/meta/language_function',
        'atum/operations/func',
        'atum/operations/object',
        'atum/operations/value_reference',
        'atum/value/number',
        'atum/value/string',
        'atum/value/property'],
function(exports,
        compute,
        func_builtin,
        object_builtin,
        meta_language_function,
        func,
        object,
        value_reference,
        number_value,
        string_value,
        property){
"use strict";

/* Operations
 ******************************************************************************/
/**
 * Create a new hosted language function.
 */
var create = function(scope, id, names, body, strict) {
    return compute.binary(
        value_reference.create(
            meta_language_function.LanguageFunction.create(
                func_builtin.FunctionPrototype,
                {},
                true,
                scope,
                id,
                names,
                body,
                strict)),
        object.construct(object_builtin.Object, []),
        function(impl, proto) {
            return object.defineProperties(compute.just(impl), {
                'prototype': property.createValuePropertyFlags(
                    proto,
                    property.WRITABLE | property.CONFIGURABLE),

                'length': property.createValuePropertyFlags(
                     new number_value.Number(length)),

                'name': property.createValuePropertyFlags(
                     (id ? new string_value.String(id) : string_value.EMPTY))
            });
        });
};

/* Export
 ******************************************************************************/
exports.create = create;

});