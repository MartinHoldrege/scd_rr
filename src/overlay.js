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
     reproject: (optional, default is true), reproject RR so layers match perfectly (should be 
     true for analysis, but false for map displays (b/ to large a file to be able to interactively
     reproject and view)
     rmap: remap the output to values of 1:9
@return (ee.Image) where first pixel is SEI class (1 = CSA) second is RR class (1 = Low), or if remap is
      true then an image with values from 1-9 (3 class Rr needed) wher 1 is CSA, H,  and 9 is ORA, L
*/
var createC3RrOverlay = function(args) {
  
  var argsScd = f.copyDict(args);
  argsScd.scen = args.scenScd;
  var c3 = load.getC3(argsScd);
  
  var argsRr = f.copyDict(args);
  argsRr.scen = args.scenRr;
  var rr0 = load.getRr(argsRr);
  
  var rmap = f.ifNull(args.rmap, false); // should pixel values be remapped?
  var reproject = f.ifNull(args.reproject, true)
  var convertTo3Class = f.ifNull(args.rr3Class, true); // by default convert RR to 3 classes (from 4)
  
  if (convertTo3Class) {
    var rr0 = f.rr3Class(rr0)
  }
  
  if (reproject) {
    var rr = ee.Image(f.matchProjections(c3, rr0))
      .updateMask(mask);
  } else {
    var rr = rr0
      .updateMask(mask);
  }

  var c3_10 = c3.multiply(10);

  var comb1 = c3_10.add(rr); // first digit is SEI class, second digit is RR class. 
    
  if (rmap & convertTo3Class) {
    var out = comb1.remap([11, 12, 13, 21, 22, 23, 31, 32, 33],
                          [3, 2, 1, 6, 5, 4, 9, 8, 7]); // 1 is CSA, H, 9 is ORA, L
  } else if (!rmap) {
    var out = comb1
  } else {
    throw new Error("Can't remap values if RR not converted to 3 classes");
  }
  
  return out.rename('c3Rr');
};

exports.createC3RrOverlay = createC3RrOverlay;

/*
historical and future SEI and RR classes

@param {object} arg can contain the following items:
     scen:  climate scenario. 
     run: optional string, default is 'Default', (i.e. the modeling assumption from STEPWAT2)
     varName: name of the categorical variable (Resist-cats or Resil-cats)
     reproject: logical (default is true), match projections of scd and rr layers, set to false for gee maps, set to true for analytics
     rmap: logical (default is false) remap the values (first and second digits then become 1-9), passed to the createC3RrOverlay function
@return (ee.Image) where first pixel is SEI class second is RR class (historical) 3rd
is SEI class in the future, and 4th is RR class in the future (unless rmap is true, then it's a two digit output)
*/
exports.c3RrHistFutOverlay = function(args) {
  
  var run = args.run;
  var varName = args.varName;
  var scen = args.scen;
  var rmap = f.ifNull(args.rmap, false);
  // create image where first digit is SEI class, second is R&R class
  var c3RrHist = createC3RrOverlay({
    scenRr: 'historical',
    scenScd: 'historical',
    rr3Class: true, // convert RR from 4 to 3 classes
    run: run,
    varName: varName,
    reproject: args.reproject,
    rmap: rmap
  });
  
  var c3RrFut = createC3RrOverlay({
    scenRr: scen,
    scenScd: scen,
    rr3Class: true, // convert RR from 4 to 3 classes
    run: run,
    varName: varName,
    reproject: args.reproject,
    rmap: rmap
  });
  
  if (rmap) {
    // first digit is historical SEI & RR class, 2nd digit is future SEI and R&R class
    var comb = c3RrHist.multiply(10).add(c3RrFut);
  } else {
    // first digit is historical SEI class, 2nd is historical RR, 3rd future SEI class, 4th future Rr class
    var comb = c3RrHist.multiply(100).add(c3RrFut);
  }
  
  return comb.rename('c3RrHist_c3RrFut'); 
};


/*
Change in class of SEI and RR

@param {object} arg can contain the following items:
     scen:  climate scenario. 
     run: optional string, default is 'Default', (i.e. the modeling assumption from STEPWAT2)
     varName: name of the categorical variable (Resist-cats or Resil-cats)
     reproject: logical (default is true), match projections of scd and rr layers, set to false for gee maps, set to true for analytics
     rr3Class: logical (default, false), convert RR to 3 classes prior to calculating class change direction
@return (ee.Image) with 4 digits (see definitions of the levels below)
*/
exports.classChangeAgree = function(args) {
  
  var reproject = f.ifNull(args.reproject, true);
  var rr3Class = f.ifNull(args.rr3Class, false);
  var argsHist = f.copyDict(args);
  argsHist.scen = 'historical';
  var c3Fut = load.getC3(args);
  var c3Hist = load.getC3(argsHist);

  var rrHist0 = load.getRr(argsHist);
  var rr0 = load.getRr(args);
  
  // note: as setup now, a change from MH+H to M RR is a decline
  // (i.e. not converting to 3 class RR, by default), so that haver higher sensitivity
  if (rr3Class) {
    var rrHist = f.rr3Class(rrHist0);
    var rr = f.rr3Class(rr0);
  } else {
      var rrHist = rrHist0;
  var rr = rr0;
  }


  
  if (reproject) {
    rr = ee.Image(f.matchProjections(c3Hist, rr));
    rrHist = ee.Image(f.matchProjections(c3Hist, rrHist));
  }

  var rr = rr.updateMask(mask);
  var rrHist = rrHist.updateMask(mask);
  
  var c3Dir = ee.Image(0)
    .where(c3Fut.gt(c3Hist), 1) // worse class (higher value means worse class)
    .where(c3Fut.lte(c3Hist), 2); // equal or better

  var RrDir = ee.Image(0)
    .where(rr.lt(rrHist), 1) // worse class (higher value means better class)
    .where(rr.gte(rrHist), 2); // equal or better in the future

    
  var comb = c3Dir
    .multiply(10)
    .add(RrDir)
    .remap([22, 21, 12, 11], 
    [1, // both stable
    2, // RR decline
    3, // SEI decline
    4 // both decline
    ]
    );
    
  return comb; 
};

