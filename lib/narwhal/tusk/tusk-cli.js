
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var STREAM = require('term').stream;
var TUSK = require("./tusk");
var THEME = require("./theme");
var FILE = require("file");
var ARGS = require("args");

var parser = exports.parser = new ARGS.Parser();

parser.help('A Narwhal project package manager.');

parser.option('--planet').set().help("the planet context for tusk");
parser.option('--sea').set().help("the sea context for tusk");
parser.option('--theme').set().help("the theme for tusk");

var commandPath = FILE.Path(module.id).dirname().join("commands");
parser.command('sea',  commandPath + '/sea/parser');
parser.command('package', commandPath + '/package/parser');
parser.command('config', commandPath + '/config/parser');
parser.command('catalog', commandPath + '/catalog/parser');

parser.helpful();


// run it

exports.main = function (planetPath, seaPath, themeType, args) {

    var theme,
        tusk;
 
    try {
        var options = parser.parse(args, {
            preActCallback: function(options, context) {
                try {

                    // initialize tusk for given planet, sea and theme
                    theme = THEME.Theme(themeType);
                    tusk = TUSK.Tusk(planetPath, seaPath, theme);
                    tusk.activate();

                    context.tusk = tusk;
                    
                } catch(e) {
                    STREAM.print("\0red(ERROR: " + e+"\0)");
                    throw e;
                }
                return true;
            }
        });
    } catch(e) {
        
        if(theme.getType()=="default") {
            STREAM.print("\0red(" + e + "\0)");

            if (e.rhinoException) {
                e.rhinoException.printStackTrace();
            }
            if (e.javaException) {
                e.javaException.printStackTrace();
            }

            return null;
        } else {
            
            throw "return proper theme error message";
            
        }
    }

    if (!options.acted) {
        parser.printHelp(options);
    }

    tusk.deactivate();

    return theme;
}
