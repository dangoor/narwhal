
var ASSERT = require("test/assert");
var FILE = require("file");
var UTIL = require("util");

var TUSK_TEST_UTIL = require("../../util.js");


exports.test = function () {

    var tusk = TUSK_TEST_UTIL.setup();

    var path = TUSK_TEST_UTIL.getBuildPath().join("seas", "sea1");
    TUSK_TEST_UTIL.expectResult(tusk,
        {
            "name": "sea1",
            "path": path.valueOf()
        },
        "sea create --name {name} {path}",
        [
            {
               "name": "{name}",
               "path": "{path}"
            }
        ]);
    TUSK_TEST_UTIL.expectFS(module.id, "test", path);
    path.rmtree();

    TUSK_TEST_UTIL.teardown(tusk);
};


if (require.main === module.id)
    require("os").exit(require("test/runner").run(exports));

