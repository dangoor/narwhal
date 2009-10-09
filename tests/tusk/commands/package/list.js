
var ASSERT = require("test/assert");
var FILE = require("file");
var UTIL = require("util");

var TUSK_TEST_UTIL = require("../../util.js");


exports.testDefault = function () {

    var tusk = TUSK_TEST_UTIL.setup();
    
    TUSK_TEST_UTIL.expectResult(tusk,
        {},
        "package list",
        [[{type: "message", match: "contains"}, [
            {
                "name": "narwhal",
                "path": tusk.getNarwhalHomePath().join("").valueOf(),
                "installed": true,
                "dependency": true,
                "locator": "CATALOG(" + tusk.getNarwhalHomePath().join("catalog.json").valueOf() + ")[narwhal]@latest"                
            },
            {
                "name": "readline",
                "path": tusk.getNarwhalHomePath().join("packages", "readline").join("").valueOf(),
                "installed": true,
                "dependency": false
            },
            {
                "name": "defaultSea",
                "path": tusk.getSea().getPath().join("").valueOf(),
                "installed": true,
                "dependency": false
            }
        ]]]);

    TUSK_TEST_UTIL.teardown(tusk);
};



if (require.main === module.id)
    require("os").exit(require("test/runner").run(exports));

