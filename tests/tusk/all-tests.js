
var assert = require("test/assert");
var util = require("util");

exports.testPackage = require("./package");

if (require.main === module.id)
    require("os").exit(require("test/runner").run(exports));

