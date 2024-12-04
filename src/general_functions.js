/**
 * General functions
 * 
 * load like this:
 * var f = require("users/martinholdrege/scd_rr:src/general_functions.js");
 * 
 * @module src/general_functions
 */

/**
 * Replace value of an object with a default value if it is null
 * @param  x, an object to test if it is null (as happens when it is an undefined
 * dictionary element)
 * @param replace, object to return if x is null
 */
exports.ifNull = function(x, replace) {
  if (x === undefined || x === null) {
    return replace;
  } else {
    return x;
  }
};
