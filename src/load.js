/*
  Purpose: Functions for loading datasets. This way these
  functions can be updated as needed (if data sources change)
  but downstream code won't be (as) affected

*/

// dependencies -----------------------------------------------------------------

var SEI = require("users/MartinHoldrege/SEI:src/SEIModule.js");
var f = require("users/MartinHoldrege/scd_rr:src/general_functions.js");

// params -----------------------------------------------------------------------

var path = SEI.path;
var pathPub = path + 'data_publication2/'; // SCD climate paper's data publication layers live here

// Dictionaries ---------------------------------------------------

// scenarios, naming used for loading files
var scenScdD = {
  'RCP45_2031-2060': 'RCP45_2031-2060', // value is the naming scheme used in file name
  'RCP45_2071-2100': 'RCP45_2071-2100',
  'RCP85_2031-2060': 'RCP85_2031-2060',
  'RCP85_2071-2100': 'RCP85_2071-2100'
};

// using same names for scenarios as scd, so can call
// corresponding RR layer, using the same scenari name
var scenRrD = {
  'RCP45_2031-2060': '2029-2064-RCP45', // value is the naming scheme used in file name
  'RCP45_2071-2100': '2064-2099-RCP45',
  'RCP85_2031-2060': '2029-2064-RCP85',
  'RCP85_2071-2100': '2064-2099-RCP85'
};



// loading scd assets ----------------------------------------------

// note when the rasters were ingested into gee they lost they're band names
// this is the order of the names in the original tifs (checked in R)

var histSEI = ee.Image(pathPub + 'SEI-Q_v11_2017-2020')
  .rename('Q5s', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'); // Q5s is the continuous SEI

exports.histC3 = SEI.seiToC3(histSEI.select('Q5s')); // historical 3 class SEI


var getFutSEI = function(args) {
  
  var scen = args.scen;
  var run = f.ifNull(args.run, 'Default');
  var summaries = f.ifNull(args.summaries, ['median']);
  
  // add .* to convert to usable regex
  var summaries2 = summaries.map(function(x) {
    return '.*' + x;
  });
  
  // currently don't actually need to the the scenScdD dictionary
  // but if change input in the future it could be helpufl
  var pathImage = pathPub + 'SEI_' + run + '_' + scenScD[scen];
  var futSEI = ee.Image(pathImage)
    .rename(['SEI_low', 'SEI_high', 'SEI_median'])
    .select(summaries);
    
  return futSEI;
};


var getFutC3 = function(args) {
  var image = SEI.seiToC3(getFutSEI(args));
  return image;
};




// functions for loading rr assets -----------------------------------------------



