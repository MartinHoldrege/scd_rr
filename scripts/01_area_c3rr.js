/*
  Purpose: Calculate the area of each combination of SEI class and R&R class,
  for different scenarios

  Author: Martin Holdrege
  
  Date started: December 5, 2024
*/

// dependencies --------------------------------------------------------------

var over = require("users/MartinHoldrege/scd_rr:src/overlay.js");
var SEI = require("users/MartinHoldrege/SEI:src/SEIModule.js");
var f = require("users/MartinHoldrege/scd_rr:src/general_functions.js");

// params ---------------------------------------------------------------------

var v = 'v1' // version, for appending to output
var testRun = false;
var region = SEI.region;
var scale = 90; // this is the scale of the scd data

var scenarioL0 = ['historical', 'RCP45_2031-2060', 'RCP45_2071-2100', 
                 'RCP85_2031-2060', 'RCP85_2071-2100'];
                 
var varRrL0 = ['Resil-cats', 'Resist-cats'];
var summaryL0 = ['median']; // for now can only median (this is the summary across GCMs)
var run = 'Default'; // STEPWAT modeling assumptions
if (testRun) {
  var region = ee.Geometry.Polygon(
        [[[-111.9, 41.94],
          [-111.9, 41.79],
          [-111.1, 41.79],
          [-111.1, 41.95]]]);
  var scale = 720;
}

// setup lists to loop over -------------------------------------------

// Create lists combining all combinations of scenarioL0, varRrL0, and summary0
var scenarioL = [];
var varRrL = [];
var summaryL = [];

scenarioL0.forEach(function(scenario) {
  varRrL0.forEach(function(varRr) {
    summaryL0.forEach(function(sum) {
      scenarioL.push(scenario);
      varRrL.push(varRr);
      summaryL.push(sum);
    });
  });
});

if (testRun) {
  // var scenarioL = scenarioL.slice(0, 2);
}


// create images and calculate areas -------------------------------------

var areaFc = ee.FeatureCollection([]);

for(var i = 0; i < scenarioL.length; i++) {

  var scen = scenarioL[i];
  var varRr = varRrL[i];
  var summary = summaryL[i];
  
  // create image where first digit is SEI class, second is R&R class
  var c3RrHist = over.createC3RrOverlay({
    scenRr: 'historical',
    scenScd: 'historical',
    rr3Class: true, // convert RR from 4 to 3 classes
    run: 'Default',
    varName: varRr
  });
  
  var c3RrFut = over.createC3RrOverlay({
    scenRr: scen,
    scenScd: scen,
    rr3Class: true, // convert RR from 4 to 3 classes
    run: 'Default',
    varName: varRr
  });
  // first digit is historical SEI class, 2nd is historical RR, 3rd future SEI class, 4th future Rr class;
  var comb = c3RrHist.multiply(100).add(c3RrFut)
    .rename('c3RrHist_C3RrFut'); 
    
  var area0 = f.areaByGroup(comb, 'c3RrHist_C3RrFut', region, scale);
  
  var area1 = area0.map(function(feature) {
    
    var area_m2 = feature.get('area_m2');
    var area_ha = ee.Number(area_m2).divide(ee.Number(10000));
    
    return feature
      .select(feature.propertyNames().remove('area_m2'))
      .set('summary', summary)
      .set('scenario', scen)
      .set('variableRR', varRr)
      .set('assumption', run)
      .set('area_ha', area_ha);
  });

  var areaFc = areaFc.merge(area1);
}

// save output ------------------------------------------------------------------

if(testRun) {
  var fileName = 'test_area_c3rr';
} else {
  var fileName = 'area_c3rr_historical_future_' + v;
}

Export.table.toDrive({
  collection: areaFc,
  description: fileName,
  folder: 'scd_rr',
  fileFormat: 'CSV'
});





