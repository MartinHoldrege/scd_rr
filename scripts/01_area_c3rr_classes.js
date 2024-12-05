/*
  Purpose: Calculate the area of each combination of SEI class and R&R class,
  for different scenarios

  Author: Martin Holdrege
  
  Date started: December 5, 2024
*/

// dependencies --------------------------------------------------------------

var over = require("users/MartinHoldrege/scd_rr:src/overlay.js");
var SEI = require("users/MartinHoldrege/SEI:src/SEIModule.js");

// params ---------------------------------------------------------------------

var testRun = true;
var region = SEI.region;
var scale = 90; // this is the scale of the scd data

var scenarioL0 = ['RCP45_2031-2060', 'RCP45_2071-2100', 
                 'RCP85_2031-2060', 'RCP85_2071-2100'];
                 
var varRrL0 = ['Resil-cats', 'Resist-cats'];
var summaryL0 = ['median']; // for now can only median (this is the summary across GCMs)
var run = 'Default' // STEPWAT modeling assumptions
if (testRun) {
  var region = ee.Geometry.Polygon(
        [[[-111.90993878348308, 41.94966671235399],
          [-111.90856549246746, 41.793206982751094],
          [-111.19170758231121, 41.791159222023346],
          [-111.17797467215496, 41.95681583816988]]]);
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
  var scenarioL = scenarioL.slice(0, 1);
}


// create images and calculate areas -------------------------------------


var i = 0;

var scen = scenarioL[i];
var varRr = varRrL[i];
var summary = summaryL[i];

// create image where first digit is SEI class, second is R&R class
var c3RrImage = over.createC3RrOverlay({
  scen: scen,
  run: 'Default',
  varName: varRr
});

print(c3RrImage)









