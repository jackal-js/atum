/**
 * @fileOverview ECMAScript 5.1 program semantics.
 */
define(['atum/compute',
        'atum/semantics/statement'],
function(compute,
        statement){
"use strict";

/* Semantics
 ******************************************************************************/
/**
 * Semantics for the body of a program or function.
 * 
 * Evaluates statements in order until a completion is found or no more statements
 * are left.
 * 
 * @param statements Array of statement computations to evaluate in order.
 * @param [declarations] Array of declarations to evaluate before evaluating any
 *    statements
 */
var sourceElements = function(statements, declarations) {
    return (declarations ?
        compute.next(
            compute.sequence.apply(undefined, declarations),
            statement.statementList(statements)) :
        statement.statementList(statements));
};

/* Export
 ******************************************************************************/
return {
    'sourceElements': sourceElements
};

});