/*
  Purpose: Functions for loading datasets. This way these
  functions can be updated as needed (if data sources change)
  but downstream code won't need to be changed (or changed less)

*/

// dependencies -----------------------------------------------------------------

var SEI = require("users/MartinHoldrege/SEI:src/SEIModule.js");
var f = require("users/MartinHoldrege/scd_rr:src/general_functions.js");

// params -----------------------------------------------------------------------

var path = SEI.path;
var pathPub = path + 'data_publication2/'; // SCD climate paper's data publication layers live here
var pathRr = 'projects/ee-martinholdrege/assets/misc/newRR3/';

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
  'RCP85_2071-2100': '2064-2099-RCP85',
  'historical': '1980-2020-Ambient'
};

// components of the image names that correspond to the types of variables
// note--be careful with these hand written dictionaries if the key/value 
// pairs aren't correct the wrong layer will be shown! the key's 
// are the names that will be shown in the drop-down menus
var varRrD = {
  'Resil-cats': ['Resil-cats', ''],
  'Resil-cont': ['Resil-cont', ''],
  'Resist-cats': ['Resist-cats', ''],
  'Resist-cont': ['Resist-cont', ''],
  'Resil-cont-delta': ['Resil-cont', '-delta'],
  'Resist-cont-delta': ['Resist-cont', '-delta']
};


// loading scd assets ----------------------------------------------

// note when the rasters were ingested into gee they lost they're band names
// this is the order of the names in the original tifs (checked in R)

var histSEI = ee.Image(pathPub + 'SEI-Q_v11_2017-2020')
  .rename('Q5s', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'); // Q5s is the continuous SEI

var histC3 = SEI.seiToC3(histSEI.select('Q5s'))
  .rename('c3'); // historical 3 class SEI

// returns image of with future (continuous) SEI
// see getFutC3 for details on arguments
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
  var pathImage = pathPub + 'SEI_' + run + '_' + scenScdD[scen];
  var futSEI = ee.Image(pathImage)
    .rename(['SEI_low', 'SEI_high', 'SEI_median'])
    .select(summaries);
    
  return futSEI;
};

/**
 * return an image of future SEI classes
 * @param  {object} args is a dictionary with these elements
 *    scen: the scenario, string of form 'RCP_yyyy-yyyy' (see names of scenScdD for possible options, or 'historical')
 *    run: optional string default is 'Default', (i.e. the modeling assumption)
 *    summaries: opitional, list of summary bands to show (one or more of low, median, high, defaults to median only)
 * dictionary element)
 * @return image with 1-3 bands. 
 */
var getC3 = function(args) {
  if(args.scen == 'historical') {
    return histC3;
  }
  var image = SEI.seiToC3(getFutSEI(args));
  return image;
};

exports.getC3 = getC3;


// functions for loading rr assets -----------------------------------------------

// return the name of the RR asset based on components of the name
var createRrImageName = function(varName, scen) {
  var varType = varRrD[varName];
  var scenario = scenRrD[scen];
  return varType[0] + '_' + scenario + varType[1];
};


/**
 * return an image of R&R
 * @param  {object} args is a dictionary with these elements
 *    varName: the the variable name, one of the names in the varRrD object.
 *    scen: the scenario of the the names in the scenRrD object. 
 * @return image with 1 band
 */
var getRr = function(args) {
    // form the image name
    var imageName = createRrImageName(args.varName, args.scen); 
    
    var image = ee.Image(pathRr + imageName);
    return image;
};

exports.getRr = getRr;



