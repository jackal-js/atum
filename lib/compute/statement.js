/**
 * @fileOverview Base statement computations.
 */
define(['atum/compute',
        'atum/completion',
        'atum/fun',
        'atum/compute/cont',
        'atum/compute/tail'],
function(compute,
        completion,
        fun,
        cont,
        tail) {
"use strict";

/* Base Computations
 ******************************************************************************/
/**
 * Computation that always succeeds with value 'x' and existing context.
 */
var just = function(x) {
    if (x === undefined || (x && typeof x === 'function'))
        debugger;
    
    return function(ctx, k) {
        return cont.appk(k, x, ctx);
    };
};

/**
 * Complete normally.
 * 
 * @param x Value stored in completion.
 */
var completeNormal = fun.compose(
    just,
    completion.NormalCompletion.create);

/**
 * Complete with an error.
 * 
 * @param x Value stored in completion.
 * @param [previous] Previous completion.
 */
var completeThrow = fun.compose(
    just,
    completion.ThrowCompletion.create);

/**
 * Complete with a return.
 * 
 * @param x Value to stored in completion.
 */
var completeReturn = fun.compose(
    just,
    completion.ReturnCompletion.create);

/**
 * Complete with a break.
 * 
 * @param {string} target Target of break. May be null if none.
 * @param x Value to store in completion.
 */
var completeBreak = fun.compose(
    just,
    completion.BreakCompletion.create);

/**
 * Complete with a continue.
 * 
 * @param {string} target Target of continue. May be null.
 * @param x Value to store in completion.
 */
var completeContinue = fun.compose(
    just,
    completion.ContinueCompletion.create)

/**
 * Compute 'p' and if it succeeds, call 'f' with results. 'f' returns the next
 * computation to perform. Return results from computation given by 'f'.
 */
var bind = function(p, f) {
    if (!p || !p.call || !f || !f.call)
        debugger;
    
    return function(ctx, k) {
        return p(ctx,
            function(x, ctx) {
                return tail.cont(f(x), [ctx, k]);
            });
    };
};

var next = function(p, q) {
    return bind(p, function(x) {
        if (x instanceof completion.AbruptCompletion)
            return just(x);
        return q;
    });
};

/* Base Computations
 ******************************************************************************/
var empty = completeNormal();

/* Base Computations
 ******************************************************************************/
var bindExpression = function(expr, f) {
    return function(ctx, k) {
        return compute.bindError(
            compute.bind(expr, function(x) {
                return f(x);
            }),
            function(x) {
                return completeThrow(x);
            })(ctx, k);
    };
};

var liftExpression = function(expr) {
    return bindExpression(expr, completeNormal);
};

/* Export
 ******************************************************************************/
return {
// Basic Computations
    'just': just,
    'bind': bind,
    'next': next,
    
    'empty': empty,
    
    'completeNormal': completeNormal,
    'completeReturn': completeReturn,
    'completeThrow': completeThrow,
    'completeBreak': completeBreak,
    'completeContinue': completeContinue,
    
    'liftExpression': liftExpression,
    'bindExpression': bindExpression
};

});