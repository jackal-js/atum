/**
 * @fileOverview 
 */
define(['exports',
        'atum/compute',
        'atum/builtin/args',
        'atum/builtin/operations/builtin_function',
        'atum/operations/environment',
        'atum/operations/error',
        'atum/operations/internal_reference',
        'atum/operations/construct',
        'atum/operations/number',
        'atum/operations/object',
        'atum/operations/string',
        'atum/operations/value_reference',
        'atum/value/number',
        'atum/value/property'],
function(exports,
        compute,
        args_builtin,
        func_builtin,
        environment,
        error,
        internal_reference,
        construct,
        number,
        object,
        string,
        value_reference,
        number_value,
        property){
"use strict";

var makeArgGetter = function(env, name) {
    return compute.bind(value_reference.create(), function(ref) {;
        return func_builtin.create(ref, '', 0, function(ref, thisObj, args) {
            return internal_reference.getFrom(
                environment.getStrictnessEnvironmentBinding(env, false, name));
        });
    });
};

var makeArgSetter = function(env, name) {
    return compute.bind(value_reference.create(), function(ref) {;
        return func_builtin.create(ref, '', 1, function(ref, thisObj, args) {
            return internal_reference.getFrom(
                environment.setEnvironmentMutableBinding(
                    env,
                    false,
                    name,
                    args.getArg(0)));
        });
    });
};

/* Operations
 ******************************************************************************/
/**
 * Create a new object.
 */
var create = function(func, names, args, env, strict) {
    var len = args.length;
    var map = {};
    var mappedNames = [];
    
    var props = {
        'length': property.createValuePropertyFlags(
            new number_value.Number(len),
            property.WRITABLE | property.CONFIGURABLE)
    };
    
    if (strict) {
        props['callee'] = property.createAccessorPropertyFlags(
            args_builtin.strictCalleeThrower,
            args_builtin.strictCalleeThrower);
        props['caller'] = property.createAccessorPropertyFlags(
            args_builtin.strictCallerThrower,
            args_builtin.strictCallerThrower);
    } else {
        props['callee'] = property.createValuePropertyFlags(
            func,
            property.CONFIGURABLE | property.WRITABLE);
    }
    
    var loop = function(obj, i) {
        if (i < 0)
            return obj;
        
         if (i < names.length) {
            var name = names[i];
            if (!strict && mappedNames.indexOf(name) === -1) {
                mappedNames.push(name);
                return loop(compute.binary(
                    makeArgGetter(env, name),
                    makeArgSetter(env, name),
                    function(get, set) {
                        return object.defineProperty(obj, i, property.createAccessorPropertyFlags(
                            get,
                            set,
                            property.CONFIGURABLE));
                    }), i - 1);
            }
        }
        return loop(
            object.defineProperty(
                obj,
                i,
                property.createValuePropertyFlags(
                    args.getArg(i),
                    property.ENUMERABLE | property.WRITABLE | property.CONFIGURABLE)),
            i - 1);
    }
    
    return compute.bind(
        construct.construct(args_builtin.Arguments, []),
        function(obj) {
            return compute.next(
                object.defineProperties(obj, props),
                loop(compute.just(obj), len - 1));
        });
};

/* Export
 ******************************************************************************/
exports.create = create;

});