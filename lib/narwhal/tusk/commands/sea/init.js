
/**
 * @test tests/tusk/commands/sea/init.js
 */

var FILE = require("file");
var SWITCH = require("./switch");
var PACKAGE = require('../../package');

var ARGS = require('args');
var parser = exports.parser = new ARGS.Parser();

parser.help('Initialize a sea for an existing package');

parser.arg("path");

parser.option('-s', '--switch', 'switch')
    .bool()
    .help('Switch to the sea after creating it');

parser.option('-f', '--force', 'force')
    .bool()
    .help('Initialize the sea even if it already exists. This effectively updates the sea');

parser.helpful();

parser.action(function (options, parentOptions, context) {
    
    var tusk = context.tusk,
        planet = tusk.getPlanet(),
        theme = tusk.getTheme();


    var path;
    if (options.args.length && !/^-/.test(options.args[0])) {
        path = options.args.shift();
    } else {
        path = fs.cwd();
    }
    path = FILE.path(path).absolute();


    var pkg = PACKAGE.Package(path);

    if(!pkg.exists()) {
        theme.newMessage({
            "path": pkg.getPath().valueOf(),
            "message": "No package found at: {path}"
        }, "{message}", "error").finalize();
        return;
    }
    if(!pkg.validate()) {
        theme.newMessage({
            "path": pkg.getPath().valueOf(),
            "message": "No valid package found at: {path}"
        }, "{message}", "error").finalize();
        return;
    }


    var sea = planet.newSea(path);

    if(sea.validate() && !options.force) {
        theme.newMessage({
            "path": sea.getPath().valueOf(),
            "message": "A valid sea already exists at: {path}"
        }, "{message}", "error").finalize();
        return;
    }

    
    sea.init({
        name: options.name
    });


    theme.newMessage({
        name: sea.getName(),
        path: sea.getPath().valueOf()
    }, "Initialized sea with name '{name}' at: {path}").finalize();
    
    
    if(options["switch"]) {
        SWITCH.action({
            args: [sea.getPath().valueOf()]
        });
    }
});
