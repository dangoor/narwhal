
var ASSERT = require("test/assert");
var UTIL = require("util");

var TUSK_TEST_UTIL = require("../../util.js");


exports.test = function () {

    var tusk = TUSK_TEST_UTIL.setup();

    TUSK_TEST_UTIL.expectResult(tusk,
        {
            "path": tusk.getSea().getPath().valueOf()
        },
        "sea list",
        [
            {
                "index": 1,
                "path": "{path}",
                "exists": true,
                "name": "defaultSea",
                "valid": true
            }
        ]);

    TUSK_TEST_UTIL.teardown(tusk);
};


if (require.main === module.id)
    require("os").exit(require("test/runner").run(exports));

