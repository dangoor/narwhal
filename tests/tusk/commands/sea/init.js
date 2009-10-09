
var ASSERT = require("test/assert");
var FILE = require("file");
var UTIL = require("util");

var TUSK_TEST_UTIL = require("../../util.js");


exports.testNoPackage = function () {

    var tusk = TUSK_TEST_UTIL.setup();

    var path = TUSK_TEST_UTIL.getBuildPath().join("seas", "sea1");
    TUSK_TEST_UTIL.expectResult(tusk,
        {
            "path": path.valueOf()
        },
        "sea init {path}",
        [
            [{
                "type": "error"
            },{
                "path": "{path}",
                "message": "No package found at: {path}"
            }]
        ]);

    TUSK_TEST_UTIL.teardown(tusk);
};


exports.testNoValidPackage = function () {

    var tusk = TUSK_TEST_UTIL.setup();

    var path = TUSK_TEST_UTIL.getBuildPath().join("seas", "sea1");
    path.mkdirs();
    path.join("TMP").touch();
    TUSK_TEST_UTIL.expectResult(tusk,
        {
            "path": path.valueOf()
        },
        "sea init {path}",
        [
            [{
                "type": "error"
            },{
                "path": "{path}",
                "message": "No valid package found at: {path}"
            }]
        ]);
    path.rmtree();

    TUSK_TEST_UTIL.teardown(tusk);
};


if (require.main === module.id)
    require("os").exit(require("test/runner").run(exports));

