
//exports.testAPI = require("./api/all-tests");

exports.testCommands = require("./commands/all-tests");

//exports.testWorkflows = require("./workflow/all-tests");



if (require.main === module.id) {
    // run tests
    var status = require("test/runner").run(exports);
    // cleanup
    require("./util.js").getBuildPath().rmtree();
    // exit
    require("os").exit(status);
}