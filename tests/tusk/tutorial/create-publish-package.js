
var ASSERT = require("test/assert");
var UTIL = require("util");

var TUSK_TEST_UTIL = require("../util.js");


exports.test = function () {

//    var tusk = TUSK_TEST_UTIL.setup();

/*
    
    // TODO: Implement this as a test
    
    
    

    // Create a new sea/project
    tusk sea create --name test-package ./test-package

    tusk sea list                                       // Optional
    
    // Activate the sea/project
    tusk sea switch test-package

    pwd                                                 // Optional
    tusk sea show                                       // Optional
    tusk sea validate                                   // Optional
    tusk package list                                   // Optional
    
    // Write some code
    cp -Rf $NARWHAL_HOME/tests/tusk/tutorial/_files/create-publish-package/* ./
    
    // Add a package as a dependency to the sea/project
    tusk package add http://github.com/cadorn/domplate/zipball/master

    tusk package list                                   // Optional
    
    // Install all sea/project dependencies
    tusk package install -f
    
    tusk package list                                   // Optional
    
    // Test the package
    narwhal tests/all-tests.js
 */


//    TUSK_TEST_UTIL.teardown(tusk);
};


if (require.main === module.id)
    require("os").exit(require("test/runner").run(exports));

