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


/*
  align two images, mostly used prior to adding images that both contain class levels
  to get class combinations (where partially overlapping pixels can create
  non-existing class combinations)
  @param {ee.Image} image1, reference image
  @param (ee.Image) image2, image to align with image1
*/
exports.matchProjections = function(image1, image2) {
  // Get the projection of image1
  var projection1 = image1.projection();

  // Reproject image2 to match image1's CRS and transform
  // keeping this as a function, so can improve how this is
  // done if needed
  var alignedImage2 = image2.reproject({
    crs: projection1.wkt(),
    scale: projection1.nominalScale()
  });

  return alignedImage2;
};
