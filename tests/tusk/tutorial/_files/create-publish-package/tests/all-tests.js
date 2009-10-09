
var ASSERT = require("test/assert");
var UTIL = require("util");

var HELLOWORLD = require("helloworld");


exports.testHelloWorld = function () {
    
    ASSERT.eq("<div style=\"color: red;\" class=\" \">HELLO WORLD</div>",
              HELLOWORLD.render("Hello World"));

};


if (require.main === module.id) {
    // run tests
    var status = require("test/runner").run(exports);
    // exit
    require("os").exit(status);
}