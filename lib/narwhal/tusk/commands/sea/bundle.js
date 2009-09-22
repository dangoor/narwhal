
var tusk = require("../../tusk");
var system = require("system");
var packages = require("packages");
var file = require("file");
var compile = require("./../../compile");
var args = require("args");
var parser = exports.parser = new args.Parser();

parser.option('-f', 'force')
    .bool()
    .help('overwrite --path if it exists');

parser.option(null, '--path', 'path')
    .set()
    .help('target path (default: build/bundle/<--flavor>)');

parser.help('bundle all installed packages in the currently active sea');

parser.helpful();


parser.action(function (options) {
    
    var type = options.args[0] || "";
    
    switch(type) {
        case "browser":
            print("Bundle type: " + type);
            break;
        case "":
            print("error: you must specify a bundle type");
            return;
        default:
            print("error: bundle type not recognized: " + type);
            return;
    }
    
    var buildDirectory = options.path || tusk.getBuildDirectory().join("bundle", type);
    
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

