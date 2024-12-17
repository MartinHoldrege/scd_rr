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


// functions ---------------------------------------------------------------

/*
Overlay showing combination of SEI class and RR class

@param {object} arg can contain the following items:
     scenRr: the scenario, string of form 'RCP_yyyy-yyyy' (see names of scenScdD (in load module
      for possible options, or 'historical'), for the R&R layer
    scenScd: the scenario for Scd    
     run: optional string default is 'Default', (i.e. the modeling assumption from STEPWAT2)
     varName: name of the categorical variable (Resist-cats or Resil-cats)
     rr3class: (optional) should categorical R&R be converted to 3 classes? (defaults to true)
     Note--down the road this can be expanded so the summary (median, min, max)
     can also be defined, now defaults to median
@return (ee.Image) where first pixel is SEI class second is RR class
*/
var createC3RrOverlay = function(args) {
  
  var argsScd = f.copyDict(args);
  argsScd.scen = args.scenScd;
  var c3 = load.getC3(argsScd);
  
  var argsRr = f.copyDict(args);
  argsRr.scen = args.scenRr;
  var rr0 = load.getRr(argsRr);
  
  if (f.ifNull(args.rr3Class, true)) {
    var rr0 = f.rr3Class(rr0)
  }

  var rr = ee.Image(f.matchProjections(c3, rr0))
    .updateMask(mask);

  var c3_10 = c3.multiply(10);

  var comb1 = c3_10.add(rr); // first digit is SEI class, second digit is RR class. 
  return comb1.rename('c3Rr');
};

exports.createC3RrOverlay = createC3RrOverlay;

/*
historical and future SEI and RR classes

@param {object} arg can contain the following items:
     scen:  climate scenario. 
     run: optional string, default is 'Default', (i.e. the modeling assumption from STEPWAT2)
     varName: name of the categorical variable (Resist-cats or Resil-cats)
@return (ee.Image) where first pixel is SEI class second is RR class (historical) 3rd
is SEI class in the future, and 4th is RR class in the future
*/
exports.c3RrHistFutOverlay = function(args) {
  
  var run = args.run;
  var varName = args.varName;
  var scen = args.scen;
  
  // create image where first digit is SEI class, second is R&R class
  var c3RrHist = createC3RrOverlay({
    scenRr: 'historical',
    scenScd: 'historical',
    rr3Class: true, // convert RR from 4 to 3 classes
    run: run,
    varName: varName
  });
  
  var c3RrFut = createC3RrOverlay({
    scenRr: scen,
    scenScd: scen,
    rr3Class: true, // convert RR from 4 to 3 classes
    run: run,
    varName: varName
  });
  
  // first digit is historical SEI class, 2nd is historical RR, 3rd future SEI class, 4th future Rr class;
  var comb = c3RrHist.multiply(100).add(c3RrFut)
    .rename('c3RrHist_c3RrFut'); 
  return comb;
};


exports.classChangeAgree = function(args) {
  
  var project = f.ifNull(args.matchProjections, false);
  var argsHist = f.copyDict(args);
  var argsHist.scen = 'Historical'
  var c3Fut = load.getC3(args);
  var c3Hist = load.getC3(argsHist);

  var rrHist0 = load.getRr(argsHist);
  var rr0 = load.getRr(args);
  
  var rrHist = f.rr3Class(rrHist0);
  var rr = f.rr3Class(rr0);
  
  if (project) {
    rr = ee.Image(f.matchProjections(c3, rr));
    rrHist = ee.Image(f.matchProjections(c3, rrHist));
  }

  var rr = rr.updateMask(mask);
  
  c3Dir = ee.Image(0)
    .where(c3Fut.gt(c3Hist), 1) // worse class (higher value means worse class)
    .where(c3Fut.eq(c3Hist), 2) // equal
    .where(c3Fut.lt(c3Hist), 3); // better
    
  RrDir = ee.Image(0)
    .where(rr.lt(rrHist), 1) // worse class (higher value means better class)
    .where(rr.eq(rrHist), 2) // equal
    .where(rr.gt(rrHist), 3);  
    
  // continue HERE
}

