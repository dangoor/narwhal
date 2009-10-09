
/**
 * @test tests/tusk/commands/sea/create.js
 */

var FILE = require("file");
var SWITCH = require("./switch");

var ARGS = require('args');
var parser = exports.parser = new ARGS.Parser();

parser.help('Create a new sea');

parser.arg("path");

parser.option('-s', '--switch', 'switch')
    .bool()
    .help('Switch to the sea after creating it.');

parser.option('-f', '--force', 'force')
    .bool()
    .help('Create the sea even if the directory is not empty');

parser.option('--name', 'name')
    .set()
    .help('The name of the sea');

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


    var sea = planet.newSea(path);

    if(sea.exists() && !options.force) {
        theme.newMessage({
            "path": sea.getPath().valueOf(),
            "message": "Directory not empty: {path}"
        }, "{message}", "error").finalize();
        return;
    }

    
    sea.create({
        name: options.name,
        force: options.force
    });


    theme.newMessage({
        name: sea.getName(),
        path: sea.getPath().valueOf()
    }, "Created sea with name '{name}' at: {path}").finalize();
    
    
    if(options["switch"]) {
        SWITCH.action({
            args: [sea.getPath().valueOf()]
        });
    }
});

