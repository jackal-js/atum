/**
 * @fileOverview ECMAScript 5.1 expression
 */
define(['atum/completion',
        'atum/compute',
        'atum/fun',
        'atum/environment_reference',
        'atum/property_reference',
        'atum/internal_reference',
        'atum/operations/construct',
        'atum/operations/error',
        'atum/operations/func',
        'atum/operations/number',
        'atum/operations/string',
        'atum/operations/boolean',
        'atum/operations/object',
        'atum/operations/undef',
        'atum/operations/type_conversion',
        'atum/operations/compare',
        'atum/operations/execution_context',
        'atum/operations/internal_reference',
        'atum/operations/value_reference',
        'atum/value/type',
        'atum/value/value'],
function(completion,
        compute,
        fun,
        environment_reference,
        property_reference,
        internal_reference_value,
        construct,
        error,
        func,
        number,
        string,
        boolean,
        object,
        undef,
        type_conversion,
        compare,
        execution_context,
        internal_reference,
        value_reference,
        type,
        value){
"use strict";

var _binaryOperator = function(op) {
    return function(left, right) {
        return compute.binary(
            internal_reference.getFrom(left),
            internal_reference.getFrom(right),
            op);
    };
};

/* 
 ******************************************************************************/
var emptyExpression = undef.UNDEFINED;

/* Unary Operator Semantics
 ******************************************************************************/
/**
 * Unary plus operator
 */
var unaryPlusOperator = fun.placeholder(
    internal_reference.dereferenceFrom,
    fun._,
    type_conversion.toNumber);

/**
 * Unary Minus operator
 */
var unaryMinusOperator = fun.compose(number.negate, internal_reference.getFrom);

/**
 * Logical Not operator
 */
var logicalNotOperator = fun.compose(boolean.logicalNot, internal_reference.getFrom);

/**
 * Bitwise not operator
 */
var bitwiseNotOperator = fun.compose(number.bitwiseNot, internal_reference.getFrom);

/**
 * Delete operator
 * 
 * Deletes the reference stored in the result of `argument`.
 */
var deleteOperator = function(argument) {
    return compute.bind(argument, function(ref) {
        if (!(ref instanceof internal_reference_value.InternalReference))
            return boolean.TRUE;
        return ref.deleteReference();
    });
};

/**
 * Void operator
 * 
 * Evaluate `argument` and discard results.
 */
var voidOperator = fun.compose(
    fun.curry(compute.then, undef.UNDEFINED),
    internal_reference.getFrom);

/**
 * Typeof operator
 * 
 * Evaluate `argument` and result in a string representing its type.
 * Errors if `argument` results in an unsupported hosted language value.
 */
var typeofOperator = function(argument) {
    return string.from(
        compute.bind(
            compute.bind(argument, function(val) {
                return (val && val.isUnresolvable ?
                    undef.UNDEFINED :
                    internal_reference.getValue(val));
            }),
            object.typeofObject));
};

/* Binary Operations
 ******************************************************************************/
/**
 * Addition operator
 */
var addOperator = function(left, right) {
    return compute.binary(
        internal_reference.dereferenceFrom(left, fun.curry(type_conversion.toPrimitive, undefined)),
        internal_reference.dereferenceFrom(right, fun.curry(type_conversion.toPrimitive, undefined)),
        function(l, r) {
            return (value.isString(l) || value.isString(r) ?
                string.concat(
                    compute.just(l),
                    compute.just(r)) :
                number.add(l, r));
        });
};

/**
 * Subtraction operator
 */
var subtractOperator = _binaryOperator(number.subtract);

/**
 * Multiplication operator
 */
var multiplyOperator = _binaryOperator(number.multiply);

/**
 * Division operator
 */
var divideOperator = _binaryOperator(number.divide);

/**
 * Modulo operator
 */
var remainderOperator = _binaryOperator(number.remainder);

/**
 * Left shift operator
 */
var leftShiftOperator = _binaryOperator(number.leftShift);

/**
 * Signed right shift operator
 */
var signedRightShiftOperator = _binaryOperator(number.signedRightShift);

/**
 * Unsigned right shift operator
 */
var unsignedRightShiftOperator = _binaryOperator(number.unsignedRightShift);

/**
 * Bitwise and operator
 */
var bitwiseAndOperator = _binaryOperator(number.bitwiseAndOperator);

/**
 * Bitwise xor operator
 */
var bitwiseXorOperator = _binaryOperator(number.bitwiseXorOperator);

/**
 * Bitwise or operator
 */
var bitwiseOrOperator = _binaryOperator(number.bitwiseOrOperator);

/* Equality Relational Operators
 ******************************************************************************/
/**
 * Equals operator
 */
var equalOperator = _binaryOperator(compare.equal);

/**
 * Strict equals operator
 */
var strictEqualOperator = _binaryOperator(compare.strictEqual);

/**
 * Semantics for a not equal operator.
 */
var notEqualOperator = fun.compose(logicalNotOperator, equalOperator);

/**
 * Semantics for a strict not equal operator.
 */
var strictNotEqualOperator = fun.compose(logicalNotOperator, strictEqualOperator);

/* Numeric Binary Relational Operators
 ******************************************************************************/
/**
 * Less than operator
 */
var ltOperator = _binaryOperator(number.lt);

/**
 * Less than or equal to operator
 */
var lteOperator = _binaryOperator(number.lte);

/**
 * Greater than operator
 */
var gtOperator = _binaryOperator(number.gt);

/**
 * Greater than or equal to operator
 */
var gteOperator = _binaryOperator(number.gte);

/**
 * Instanceof operator
 */
var instanceofOperator = fun.compose(
    boolean.from,
    _binaryOperator(fun.flip(object.hasInstance)));

/**
 * In operator
 */
var inOperator = fun.compose(
    boolean.from,
    _binaryOperator(function(lref, rref) {
        return value_reference.dereference(rref, function(rval) {
            if (!value.isObject(rval))
                return error.typeError(string.create('in rhs not object'));
            return compute.bind(
                string.toHost(lref),
                function(key) {
                    return object.hasProperty(rref, key);
                });
        });
    }));

/* Update Operator Semantics
 ******************************************************************************/
var _prefixUpdate = function(op) {
    return function(arg) {
        return compute.bind(arg, function(x) {
            if (!(x instanceof internal_reference_value.InternalReference))
                return error.referenceError(string.create("Prefix update operator applied to non reference value"));
            return compute.bind(
                internal_reference.dereference(x, type_conversion.toNumber),
                function(val) {
                    return op(x, val);
                });
        });
    };
};

var _postfixUpdate = function(op) {
    return function(arg) {
        return compute.bind(arg, function(x) {
            if (!(x instanceof internal_reference_value.InternalReference))
                return error.referenceError(string.create("Postfix update operator applied to non reference value"));
            return compute.bind(
                internal_reference.dereference(x, type_conversion.toNumber),
                function(val) {
                    return compute.next(
                        op(x, val),
                        compute.just(val));
                });
        });
    };
};

var _increment = function(expr, val) {
    return compute.bind(
        number.increment(val),
        fun.curry(internal_reference.setValue, expr));
};

var _decrement = function(expr, val) {
    return compute.bind(
        number.decrement(val),
        fun.curry(internal_reference.setValue, expr));
};

/**
 * Semantics for a prefix increment operation.
 * 
 * Gets the current value of reference 'arg' as a number and increments bound
 * value of reference 'arg'.
 * 
 * Errors if 'arg' does not return a reference value.
 * 
 * @param arg Computation that returns a reference.
 * 
 * @return New value bound to reference 'arg'.
 */
var prefixIncrement = _prefixUpdate(_increment);

/**
 * Semantics for a postfix increment operation.
 * 
 * Gets the current value of reference 'arg' as a number and increments bound
 * value of reference 'arg'.
 * 
 * Errors if 'arg' does not return a reference value.
 * 
 * @param arg Computation that returns a reference.
 * 
 * @return Old value bound to reference 'arg' as a number.
 */
var postfixIncrement = _postfixUpdate(_increment);

/**
 * Semantics for a prefix decrement operation.
 * 
 * Gets the current value of reference 'arg' as a number and decrements bound
 * value of reference 'arg'.
 * 
 * Errors if 'arg' does not return a reference value.
 * 
 * @param arg Computation that returns a reference.
 * 
 * @return New value bound to reference 'arg'.
 */
var prefixDecrement = _prefixUpdate(_decrement);

/**
 * Semantics for a postfix decrement operation.
 * 
 * Gets the current value of reference 'arg' as a number and decrements bound
 * value of reference 'arg'.
 * 
 * Errors if 'arg' does not return a reference value.
 * 
 * @param arg Computation that returns a reference.
 * 
 * @return Old value bound to reference 'arg' as a number.
 */
var postfixDecrement = _postfixUpdate(_decrement);

/* Logical Binary Operator Semantics
 ******************************************************************************/
/**
 * Logical or operation
 * 
 * Shorts when left evaluates to true.
 */
var logicalOr = function(left, right) {
    return compute.bind(
        internal_reference.getFrom(left),
        function(l) {
            return compute.branch(
                boolean.isTrue(l),
                compute.just(l),
                internal_reference.getFrom(right));
        });
};

/**
 * Logical and operation
 * 
 * Shorts when left evaluates to false.
 */
var logicalAnd = function(left, right) {
    return compute.bind(
        internal_reference.getFrom(left),
        function(l) {
            return compute.branch(
                boolean.isTrue(l),
                internal_reference.getFrom(right),
                compute.just(l));
        });
};

/* 
 ******************************************************************************/
/**
 * Call expression
 * 
 * Fails if 'callee' is not callable.
 * 
 * @param callee Computation resulting in object being called. 
 * @param args Array of zero or more computations that give the arguments to
 *  call 'callee' with.
 */
var callExpression = (function() {
    var getBase = function(ref) {
        return (ref instanceof property_reference.PropertyReference ?
            ref.getBase() :
            compute.bind(ref.getBase(), function(base) { return base.implicitThisValue(); }));
    };
    
    var thisBinding = function(ref) {
        return (ref instanceof internal_reference_value.InternalReference ?
            getBase(ref) :
            undef.UNDEFINED);
    };
    
    return function(callee, args) {
        return internal_reference.dereferenceFrom(callee, function(o, ref) {
            return compute.bind(thisBinding(ref), function(t) {
                return func.functionCall(
                    o,
                    t,
                    compute.enumerationa(fun.map(internal_reference.getFrom, args)));
            });
        });
    };
}());

/**
 * New Expression
 */
var newExpression = function(callee, args) {
    return compute.binds(
        compute.enumeration(
            internal_reference.getFrom(callee),
            compute.enumerationa(fun.map(internal_reference.getFrom, args))),
        construct.construct);
};

/**
 * Member expression
 */
var memberExpression = function(base, property) {
    return internal_reference.dereferenceFrom(base, function(baseValue, baseRef) {
        return compute.binds(
            compute.enumeration(
                value_reference.getValue(baseValue),
                internal_reference.dereferenceFrom(property, string.toHost)),
            function(baseObj, propertyName) {
                return (baseObj instanceof value.Value ?
                    property_reference.create(propertyName, baseValue) :
                    environment_reference.create(propertyName, baseRef));
            });
    });
};

/* 
 ******************************************************************************/
/**
 * Conditional Expression.
 */
var conditionalExpression = function(test, consequent, alternate) {
    return internal_reference.getFrom(
        compute.branch(
            internal_reference.dereferenceFrom(test, boolean.isTrue),
            consequent,
            alternate));
};

/**
 * Sequence expression
 * 
 * @param expressions Array of two or more expression computations.
 */
var sequenceExpression = fun.compose(
    compute.sequencea,
    fun.curry(fun.map, internal_reference.getFrom));

/**
 * This expression
 */
var thisExpression = execution_context.thisBinding;

/* Assignment Semantics
 ******************************************************************************/
var _dereference = function(ref) {
    return compute.bind(ref, function(x) {
        if (!(x instanceof internal_reference_value.InternalReference))
            return compute.error("Left hand side not reference");
        
        if (x.strict && (x.name === "eval" || x.name === "arguments"))
            return compute.error("Using eval/arguments in strict");
        
        return compute.just(x);
    });
};

/**
 * Assignment expression
 */
var assignment = function(left, right) {
    return compute.binary(
        _dereference(left),
        internal_reference.getFrom(right),
        function(l, r) {
            return compute.next(
                internal_reference.setValue(l, r),
                compute.just(r));
        });
};

/**
 * Compound Assignment expression
 */
var compoundAssignment = function(op, left, right) {
    return compute.bind(left, function(lref) {
        return assignment(
            compute.just(lref),
            op(
                internal_reference.getValue(lref),
                internal_reference.getFrom(right)));
        });
};

/* Export
 ******************************************************************************/
return {
    'emptyExpression': emptyExpression,
    
// Binary Operator Semantics
    'addOperator': addOperator, 
    'subtractOperator': subtractOperator, 
    'multiplyOperator': multiplyOperator, 
    'divideOperator': divideOperator, 
    'remainderOperator': remainderOperator, 
    
    'leftShiftOperator': leftShiftOperator, 
    'signedRightShiftOperator': signedRightShiftOperator, 
    'unsignedRightShiftOperator': unsignedRightShiftOperator, 
    'bitwiseAndOperator': bitwiseAndOperator,
    'bitwiseXorOperator': bitwiseXorOperator,
    'bitwiseOrOperator': bitwiseOrOperator,

// Binary Comparision Operator Semantics
    'equalOperator': equalOperator,
    'strictEqualOperator': strictEqualOperator,
    'notEqualOperator': notEqualOperator,
    'strictNotEqualOperator': strictNotEqualOperator,
    
//Binary Relational Operator Semantics
    'ltOperator': ltOperator,
    'lteOperator': lteOperator,
    'gtOperator': gtOperator,
    'gteOperator': gteOperator,
    'instanceofOperator': instanceofOperator,
    'inOperator': inOperator,

// Increment and Decrement Operator Semantics
    'prefixIncrement': prefixIncrement,
    'postfixIncrement': postfixIncrement,
    'prefixDecrement': prefixDecrement,
    'postfixDecrement': postfixDecrement,

// Unary Operator Semantics
    'unaryPlusOperator': unaryPlusOperator,
    'unaryMinusOperator': unaryMinusOperator,
    'logicalNotOperator': logicalNotOperator,
    'bitwiseNotOperator': bitwiseNotOperator,
    'deleteOperator': deleteOperator,
    'voidOperator': voidOperator,
    'typeofOperator': typeofOperator,

// Logical Semantics
    'logicalOr': logicalOr,
    'logicalAnd': logicalAnd,

//
    'callExpression': callExpression,
    'newExpression': newExpression,
    'memberExpression': memberExpression,
    
// Expression Semantics
    'conditionalExpression': conditionalExpression,
    'sequenceExpression': sequenceExpression,
    'thisExpression': thisExpression,
    
// Assignment
    'assignment': assignment,
    'compoundAssignment': compoundAssignment
};

});