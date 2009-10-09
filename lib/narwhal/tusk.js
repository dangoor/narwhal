
var SYSTEM = require("system");
var STREAM = require('term').stream;
var TUSK = require("./tusk/tusk");


var TUSK_CLI = require("narwhal/tusk/tusk-cli");

// borrow the actual tusk-cli to service --help info
var parser = TUSK_CLI.parser;


exports.main = function (args) {
    var acted = false;
    var options = parser.parse(args, {
        preActCallback: function(options, context) {
            
            // for any calls other than help related
            if(options.args.length>0) {

                try {
                    var tusk = TUSK.Tusk(options.planet, options.sea, options.theme);
                    
                    acted = true;
                    
                    // call tusk via sandbox
                    tusk.command(options.args);
    
                } catch(e) {
                    STREAM.print("\0red(ERROR: " + e+"\0)");
                    throw e;
                }
            }
            return false;
        }
    });

    if (!acted) {
        parser.printHelp(options);
    }
}

if (module.id == require.main) {
    exports.main(SYSTEM.args);
}
