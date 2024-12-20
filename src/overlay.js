/*
 @module
  Purpose: function(s) that combine( SEI class and R&R class,
  so the first number in a pixel gives the SEI class (1-3, 1 = CSA, 3 = ORA)
  and the second gives the R&R class (1-4, 1 = low, 4 LH/H)

  Author: Martin Holdrege
  
  to load:
  var over = require("users/MartinHoldrege/scd_rr:src/overlay.js");
*/

// dependencies -----------------------------------------------------------

// var SEI = require("users/MartinHoldrege/SEI:src/SEIModule.js");
var load = require("users/MartinHoldrege/scd_rr:src/load.js");
var f = require("users/MartinHoldrege/scd_rr:src/general_functions.js");

// params ------------------------------------------------------------------

var mask = load.getC3({scen: 'historical'}).gt(0);


// readin in and combine images
var args = {
  scen: 'historical',
  varName: 'Resist-cats'// the name of the R&R variable (needs to be categorical)
};


/*
Overlay showing combination of SEI class and RR class

@param {object} arg can contain the following items:
     scen: the scenario, string of form 'RCP_yyyy-yyyy' (see names of scenScdD (in load module
      for possible options, or 'historical')
     run: optional string default is 'Default', (i.e. the modeling assumption from STEPWAT2)
     varName: name of the categorical variable (Resist-cats or Resil-cats)
     Note--down the road this can be expanded so the summary (median, min, max)
     can also be defined, now defaults to median
@return (ee.Image) where first pixel is SEI class second is RR class
*/
var createC3RrOverlay = function(args) {
  var c3 = load.getC3(args);
  var rr0 = load.getRr(args);

  var rr = ee.Image(f.matchProjections(c3, rr0))
    .updateMask(mask);

  var c3_10 = c3.multiply(10);

  var comb1 = c3_10.add(rr); // first digit is SEI class, second digit is RR class. 
  return comb1.rename('c3Rr');
};

exports.createC3RrOverlay = createC3RrOverlay;
