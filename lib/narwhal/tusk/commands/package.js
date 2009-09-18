
var tusk = require("../tusk");
var system = require("system");
var packages = require("packages");
var file = require("file");
var compile = require("./../compile");
var args = require("args");
var parser = exports.parser = new args.Parser();

parser.option('-f', 'force')
    .bool()
    .help('overwrite --path if it exists');

parser.option('--flavor', 'flavor')
    .set()
    .help('type of package [browser] (default: browser)');

parser.option(null, '--path', 'path')
    .set()
    .help('target path (default: build/package/<--flavor>)');

parser.help('bundle all installed packages');

parser.helpful();


parser.action(function (options) {
    
    var flavor = options.flavor || "browser";

    switch(flavor) {
        case "browser":
            print("Package flavor: " + flavor);
            break;
        default:
            print("error: flavor not recognized: " + flavor);
            return;
    }
    
    var buildDirectory = options.path || tusk.getBuildDirectory().join("package", flavor);
    
    if(buildDirectory.exists()) {
        if(!options.force) {
            print("error: target path exists: " + buildDirectory + ". Use -f to overwrite.");
            return;
        } else {
            print("Deleting target directory: " + buildDirectory);
            file.rmtree(buildDirectory);
        }
    }

    print("Consolidating all modules for all installed packages to: " + buildDirectory);

    compile.build(buildDirectory, system, packages);
    
});

exports.remove = function () {
};

