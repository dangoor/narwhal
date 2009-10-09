
var ASSERT = require("test/assert");
var UTIL = require("util");


var TUSK_TEST_UTIL = require("../util.js");



exports.testWorkflow = function () {

    var planet = TUSK_TEST_UTIL.newPlanet("default"),
        sea = TUSK_TEST_UTIL.newSea("default"),
        command;
    
    
//    command = "sea create --name '' ";
//    TUSK.command(planet, sea, command);


    planet.destroy(TUSK_TEST_UTIL.getBuildPath());
    sea.destroy(TUSK_TEST_UTIL.getBuildPath());
};


if (require.main === module.id)
    require("os").exit(require("test/runner").run(exports));

