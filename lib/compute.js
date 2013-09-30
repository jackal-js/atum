/**
 * @fileOverview Base combinatorial computations.
 * 
 * A computation takes an execution context and two callbacks, 'ok' and 'err',
 * for success and failure. Both callbacks take a value to return and a context
 * to continue computation in.
 */
define(['amulet/object'],
function(amulet_object) {
"use strict";

var reduceRight = Function.prototype.call.bind(Array.prototype.reduceRight);

var curry = function(f /*, ...*/) { return f.bind.apply(f, arguments); };

var identity = function(x) { return x; };

var constant = function(x) { return function() { return x; }; };

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

/* Context
 ******************************************************************************/
/**
 * A computation state.
 * 
 * @param values Object that maps keys to values referenced in a computation.
 * @param userData User computation context.
 * @parar now Current time of the context.
 */
var ComputeContext = function(values, userData, now) {
    this.values = values;
    this.userData = userData;
    this.now = now;
};

/**
 * Empty computation context that stores no values and has no user data.
 */
ComputeContext.empty = new ComputeContext({}, null, null);

/**
 * Create a new context with given values.
 */
ComputeContext.setValues = function(ctx, values) {
    return new ComputeContext(
        values,
        ctx.userData,
        ctx.now);
};

/**
 * Create a new context given user data.
 */
ComputeContext.setUserData = function(ctx, ud) {
    return new ComputeContext(
        ctx.values,
        ud,
        ctx.now);
};

/**
 * Create a new context with given current time.
 */
ComputeContext.setNow = function(ctx, now) {
    return new ComputeContext(
        ctx.values,
        ctx.userData,
        now);
};

/* Creation
 ******************************************************************************/
/**
 * Creates a named computation.
 * 
 * @param {string} name Human readable name used to identify this computation for
 *     debugging purposes.
 */
var Computation = function(name, impl) {
    return Object.defineProperties(impl, {
        'displayName': {
            'value': name,
            'writable': false
        }
    });
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
 * Computation that always fails with value 'x' and existing context.
 */
var error = function(x) {
    return function(ctx, ok, err) {
        return err(x, ctx);
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
            function(x, ctx) { return cont(f(x), [ComputeContext.setNow(ctx, new Date()), ok, err]); },
            err);
    };
};


/**
 * Compute 'p' and if it fails, call 'f' with results. 'f' returns the next
 * computation to perform. Return results from computation given by 'f'.
 */
var bindError = function(p, f) {
    if (!p || !p.call || !f || !f.call)
        debugger;
    
    return function(ctx, ok, err) {
        return p(ctx,
            ok,
            function(x, ctx) { return f(x, ctx)(ctx, ok, err); });
    };
};

/* Continuations
 ******************************************************************************/
/**
 * Call with current continuation. Captures the execution state of a computation.
 * 
 * @param f Function called with two arguments, kok and kerr, for the current
 *    success continuation and failure continuations. Returns either a computation
 *    or the result of calling kok or kerr.
 */
var callcc = function(f) {
    return function(ctx, ok, err) {
        return f(function(x) {
            return function(/*ctx, ok, err*/) { return ok(x, ctx); };
        },
        function(x) {
            return function(/*ctx, ok, err*/) { return err(x, ctx); };
        })(ctx, ok, err);
    };
};

/**
 * Computation that returns 'x' immediately, without calling any continuation.
 * 
 * @param x Value to return.
 */
var abrupt = function(x) {
    return function(/*ctx, ok, err*/) {
        return x;
    };
};

/* Helper Computations
 ******************************************************************************/
/**
 * Noop computation.
 */
var empty = just(null);

/**
 * Compute 'p' and if it succeeds, call 'f' with the results of 'p' as arguments.
 */
var binds = function(p, f) {
    return bind(p, function(x) {
        return f.apply(undefined, x);
    });
};

/**
 * Compute 'l' then 'r' and call 'f' with results.
 */
var binary = function(l, r, f) {
    return bind(l, function(lVal) {
        return bind(r, function(rVal) {
            return f(lVal, rVal);
        });
    });
};

/**
 * Compute 'p', discard results and return result from 'q'.
 */
var next = function(p, q) {
    if (!p || !p.call || !q || !q.call) {
        debugger;
    }
    return bind(p, constant(q));
};

/**
 * Compute 'p', discard results and return results from 'p'.
 */
var then = function(p, q) {
    if (!p || !p.call || !q || !q.call) {
        debugger;
    }
    return bind(p, function(x) {
        return next(q, just(x));
    });
};


/**
 * Compute `open`, `p`, then `close`, returning results from `p`.
 */
var between = function(open, close, p) {
    return next(open, then(p, close));
};

/* Context Computations
 ******************************************************************************/
/**
 * Computation that alters the computation context with function 'f'.
 * 
 * @param f Function that takes the existing computation context and returns 
 *     a new context.
 */
var modifyComputeContext = function(f) {
    return function(ctx, ok, err) {
        var newCtx = f(ctx);
        return ok(newCtx, newCtx);
    }
};

/**
 * Computation taht sets the computation contex to 'ctx'.
 */
var setComputeContext = function(ctx) {
    return modifyComputeContext(constant(ctx));
};

/**
 * Computation that succeeds with the compute context.
 */
var computeContext = modifyComputeContext(identity);

/**
 * Computation that examines the compute context with function 'f' and
 * succeeds with result.
 */
var extractComputeContext = function(f) {
    return bind(computeContext, function(ctx) {
        return just(f(ctx));
    });
};

/**
 * Computation that modifies the compute context values with 'f'.
 * 
 * @param f Function that takes the current values and returns the new values.
 */
var modifyValues = function(f) {
    return modifyComputeContext(function(ctx) {
        return ComputeContext.setValues(ctx, f(ctx.values));
    });
};

/**
 * Computation sets the compute context values to 'values'
 */
var setValues = function(values) {
    return modifyValues(constant(values));
};

/**
 * Computation that succeeds with the context values.
 */
var values = extractComputeContext(function(ctx) {
    return ctx.values;
});

/**
 * Computation that gets the stored value for 'key'.
 */
var getValue = function(key) {
    return bind(values, function(v) {
        return just(v.hasOwnProperty(key) ? v[key] : null);
    });
};

/**
 * Computation that sets the stored value for 'key' to 'x'.
 */
var setValue = function(key, x) {
    return modifyValues(function(v){
        return amulet_object.defineProperty(v, key, {
            'value': x,
            'enumerable': true,
            'configurable': true
        });
    });
};

/**
 * Computation that modifies the user context with 'f'.
 * 
 * @param f Function that takes the current user context and returns a 
 *    new user context.
 */
var modifyContext = function(f) {
    return modifyComputeContext(function(ctx) {
        return ComputeContext.setUserData(ctx, f(ctx.userData));
    });
};

/**
 * Computation that sets the user context to 'ud'.
 */
var setContext = function(ud) {
    return modifyContext(constant(ud));
};

/**
 * Computation that succeeds with the user context.
 */
var context = extractComputeContext(function(ctx) {
    return ctx.userData;
});

/**
 * Computation that extract a value from the user context with 'f'.
 * 
 * @param f Function that takes the current user context and returns the value
 *    to succeed with.
 */
var extract = function(f) {
    return bind(context, function(ctx) {
        return just(f(ctx));
    });
};

/**
 * Computation that modifies the compute context values with 'f'.
 * 
 * @param f Function that takes the current values and returns the new values.
 */
var modifyNow = function(f) {
    return modifyComputeContext(function(ctx) {
        return ComputeContext.setNow(ctx, f(ctx.now));
    });
};

/**
 * Computation sets the compute context now time to 'now'
 */
var setNow = function(now) {
    return modifyNow(constant(now));
};

/**
 * Computation that succeeds with the computation now time.
 */
var getNow = extractComputeContext(function(ctx) {
    return ctx.now;
});


/* Sequence Computations
 ******************************************************************************/
var _end = just([]);

/**
 * Computation that cons result of 'value' onto list result of 'rest'
 */
var cons = function(value, rest) {
    return binary(value, rest, function(x, xs) {
        return just(([x]).concat(xs));
    });
};

/**
 * Computation that performs a sequence of computations in order and returns
 * the last result.
 */
var sequencea = (function(){
    var reducer = function(p, c) { return next(c, p); };
    
    return function(arr) {
        return (!arr.length ?
            empty : 
            reduceRight(arr, reducer));
    };
}());  

/**
 * Same as 'sequencea' but takes an argument list of computation.
 */
var sequence = function(/*...*/) {
    return sequencea(arguments);
};

/**
 * Computation that performs an ordered sequence of computations and succeeds
 * with a list of results.
 */
var enumerationa = (function(){
    var reducer = function(p, c) { return cons(c, p); };
    
    return function(arr) {
        return reduceRight(arr, reducer, _end);
    };
}());  

/**
 * Same as 'enumerationa' but takes an argument list of computations.
 */
var enumeration = function(/*...*/) {
    return enumerationa(arguments);
};

/* 
 ******************************************************************************/
var yes = just(true);

var no = just(false);

var bool = function(x) {
    return (x ? yes : no);
};

var branch = function(test, conditional, alternative) {
    alternative = alternative || empty;
    return bind(test, function(x) {
        return (x ? conditional : alternative);
    });
};

/* 
 ******************************************************************************/
var lift = function(f) {
    return function(/*...*/) {
        return just(f.apply(undefined, arguments));
    };
};

/* Export
 ******************************************************************************/
return {
    'cont': cont,
    'trampoline': trampoline,
    
    'ComputeContext': ComputeContext,
    
// Creation
    'Computation': Computation,

// Basic Computations
    'just': just,
    'error': error,
    'bind': bind,
    'bindError': bindError,
    
// Continuation Computations
    'callcc': callcc,
    'abrupt': abrupt,
    
// Helper Computations
    'empty': empty,
    'binds': binds,
    'next': next,
    'then': then,
    'between': between,
    'binary': binary,

// Context Computations
    'modifyComputeContext': modifyComputeContext,
    'setComputeContext': setComputeContext,
    'computeContext': computeContext,
    'extractComputeContext': extractComputeContext,
    
    'modifyValues': modifyValues,
    'setValues': setValues,
    'values': values,
    'getValue': getValue,
    'setValue': setValue,
    
    'context': context,
    'modifyContext': modifyContext,
    'setContext': setContext,
    'extract': extract,
    
    'getNow': getNow,
    'setNow': setNow,
    'modifyNow': modifyNow,
    
// Sequence Computations
    'cons': cons,
    
    'sequencea': sequencea,
    'sequence': sequence,
    
    'enumerationa': enumerationa,
    'enumeration': enumeration,
//
    'yes': yes,
    'no': no,
    'bool': bool,
    'branch': branch,
    
//
    'lift': lift
};

});