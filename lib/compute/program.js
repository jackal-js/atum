/**
 * @fileOverview Base statement computations.
 */
define(['atum/completion',
        'atum/compute',
        'atum/operations/error',
                'atum/operations/undef'],
function(completion,
        compute,
        error,
        undef) {
"use strict";

/* Continuation
 ******************************************************************************/
var cont = function(f, args) {
    var c = [f, args];
    c._next = true;
    return c;
};

var trampoline = function(f) {
    var value = f;
    while (value && value._next)
        value = value[0].apply(undefined, value[1]);
    return value;
};

/* Base Computations
 ******************************************************************************/
/**
 * Computation that always succeeds with value 'x' and existing context.
 */
var just = function(x) {
    if (x === undefined || (x && typeof x === 'function'))
        debugger;
    
    return function(ctx, ok, err) {
        return ok(x, ctx);
    };
};

/**
 * Compute 'p' and if it succeeds, call 'f' with results. 'f' returns the next
 * computation to perform. Return results from computation given by 'f'.
 */
var bind = function(p, f) {
    if (!p || !p.call || !f || !f.call)
        debugger;
    
    return function(ctx, ok, err) {
        return p(ctx,
            function(x, ctx) {
                return cont(f(x), [ctx, ok, err]);
            },
            err);
    };
};

var next = function(p, q) {
    return bind(p, function() { return q });
};

/* Base Computations
 ******************************************************************************/
var liftStatement = function(statement) {
    return function(ctx, ok, err) {
        return statement(ctx,
            function(x, ctx) {
                switch (x.type) {
                case completion.ThrowCompletion.type:
                    return compute.error(x.value);
                case completion.NormalCompletion.type:
                    return compute.just(x.value);
                }
                return compute.just(x);
        });
    };
};

var bindStatement = function(statement, f) {
    return function(ctx, ok, err) {
        return statement(ctx,
            function(x, ctx) {
                return cont(f(x), [ctx, ok, err]);
        });
    };
};



/* Export
 ******************************************************************************/
return {
// Basic Computations
    'just': just,
    'bind': bind,
    'next': next,
    
    
    'liftStatement': liftStatement,
    'bindStatement': bindStatement
};

});