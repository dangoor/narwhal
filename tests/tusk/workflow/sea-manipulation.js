
var ASSERT = require("test/assert");
var UTIL = require("util");

var TUSK_TEST_UTIL = require("../util.js");
var TUSK = require("narwhal/tusk/tusk");


exports.testWorkflow = function () {

    var planet = TUSK_TEST_UTIL.newPlanet("default"),
        sea = TUSK_TEST_UTIL.newSea("default"),
        tusk = TUSK.Tusk(planet, sea);
        
    var path,
        command;

    
    // establish a path for test sea
    path = TUSK_TEST_UTIL.getBuildPath().join("test-sea");


    // create a new sea with name 'test-sea' at path
//    command = "sea create --name 'test-sea' " + path.valueOf();
    command = "sea list";
    tusk.command(command);



    planet.destroy(TUSK_TEST_UTIL.getBuildPath());
    sea.destroy(TUSK_TEST_UTIL.getBuildPath());
};


if (require.main === module.id)
    require("os").exit(require("test/runner").run(exports));

