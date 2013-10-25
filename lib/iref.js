/**
 * @fileOverview
 */
define(['atum/compute',
        'atum/internal_reference'],
function(compute,
        internal_reference) {
"use strict";

/* Iref
 ******************************************************************************/
/** 
 * Irefs are a specific case of internal references. The value they refer to
 * is stored in the computation context's value store.
 */
var Iref = function(key) {
    this.key = key;
};
Iref.prototype = new internal_reference.InternalReference;
Iref.prefix = "iref:";

Iref.create = function(key) {
    return new Iref(key);
};

Iref.prototype.getValue = function() {
    return compute.getValue(Iref.prefix + this.key);
};

Iref.prototype.setValue = function(x) {
    return compute.next(
        compute.setValue(Iref.prefix + this.key, x),
        compute.just(this));
};

/* Export
 ******************************************************************************/
return {
    'Iref': Iref
};

});