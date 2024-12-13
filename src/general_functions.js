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


/**
 * Area of pixels belonging to each group
 * 
 * @param {ee.Image} image input that contains a grouping/classification/id band
 * @param {ee.String} groupName name of band that will be used for grouping (i.e. the ids)
 * @param (ee.Feature} region to apply reducer to
 * @param {ee.Number} scale to using when applying reducer 
 * 
 * @return {ee.FeatureCollection} area of each unique value in groupName
 * Note this function was originally defined in the 
 * "users/mholdrege/newRR_metrics:src/functions.js" module
*/
exports.areaByGroup = function(image, groupName, region, scale) {
  var areaImage = ee.Image.pixelArea()
    .addBands(image.select(groupName));
 
  
  var areas = areaImage.reduceRegion({
        reducer: ee.Reducer.sum().group({
        groupField: 1,
        groupName: groupName,
      }),
      geometry: region,
      scale: scale,
      maxPixels: 1e12
      }); 
  
  
  // converting a feature collection so that it can be output as csv
    var areasDict = ee.List(areas.get('groups')).map(function (x) {
    
    var dict = {area_m2: ee.Dictionary(x).get('sum')};
    
    // passing groupName as a variable to become the name in the dictionary
    dict[groupName] = ee.Number(ee.Dictionary(x).get(groupName)).toInt64();
    
    return ee.Feature(null, dict);
  });
  
  var areasFc = ee.FeatureCollection(areasDict);
  
  return areasFc;
};

exports.rr3Class = function(image) {
  return image.remap([1, 2, 3, 4], [1, 2, 3, 3]);
};
