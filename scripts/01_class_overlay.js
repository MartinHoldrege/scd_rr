/*
  Purpose: Create an overlay of SEI class and R&R class,
  so the first number in a pixel gives the SEI class (1-3, 1 = CSA, 3 = ORA)
  and the second gives the R&R class (1-4, 1 = low, 4 LH/H)

  Author: Martin Holdrege
  
  Date started: December 4, 2024
*/

// dependencies -----------------------------------------------------------

var SEI = require("users/MartinHoldrege/SEI:src/SEIModule.js");
var load = require("users/MartinHoldrege/scd_rr:src/load.js");

// params ------------------------------------------------------------------

var crs = SEI.crs; // to transform RR so that the overlay is exact. 

// TO DO
// the following code will put into a function
var args = {
  scen: 'historical',
  varName: 'Resist-cats'// the name of the R&R variable (needs to be categorical)
};

var c3 = load.getC3(args);
var rr = load.getRr(args);
print(c3)
print(c3.projection().wkt())

// CONTINUE HERE
// steps
// transform 
// Compare transform (affine) parameters
var transform1 = proj1.transform();
var transform2 = proj2.transform();

if (ee.Algorithms.IsEqual(transform1, transform2)) {
  print('Transform parameters are identical.');
} else {
  print('Transform parameters differ.');
}