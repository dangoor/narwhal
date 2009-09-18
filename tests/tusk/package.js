
var assert = require("test/assert");
var util = require("util");


exports.testPackageAdd = function () {

    assert.eq(true, true);
};


if (require.main === module.id)
    require("os").exit(require("test/runner").run(exports));

