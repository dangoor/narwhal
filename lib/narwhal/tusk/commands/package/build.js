
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var util = require('util');
var fs = require('file');
var OS = require('os');
var CATALOG = require('../../catalog');
var PACKAGE = require('../../package');
var SEA = require('../../sea');
var args = require('args');

var parser = exports.parser = new args.Parser();

parser.arg("package");

parser.option('--target', 'target')
    .set()
    .help('The target to build.');

parser.option('-l', '--list', 'list')
    .bool()
    .help('List all build targets.');

parser.option('--spawn', 'spawn')
    .bool()
    .help('Run build in a separate process.');

parser.help('Build a given package.');

parser.helpful();


parser.action(function (options) {
    
    var sea = SEA.getActive(),
        name = options.args[0];
    if(!name) {
        print("error: you must specify a package to build.");
        return;
    }
    var pkg = sea.getPackage(name);
    if(!pkg || !pkg.exists()) {
        print("error: could not find installed package: " + name);
        return;
    }
    var targets = pkg.getManifest().getBuildTargetNames();
    if(!targets) {
        print("error: no build targets defined in package.json");
        return;
    }
    
    if(options.list) {
        print("Supported build targets:");
        targets.forEach(function(name) {
            print("  " + name);
        });
        return;
    }
    
    var target = options.target;
    if(!target) {
        target = pkg.getManifest().getDefaultBuildTargetName();
        if(!target) {
            print("error: no default build target specified in package.json");
            return;
        }
    }
    
    if(!util.has(targets, target)) {
        print("error: build target not defined: " + target);
        return;
    }
    
    print("Building target '" + target + "' for package '" + name + "'");

    var targetModule = pkg.getManifest().getBuildTarget(target),
        modulePath = pkg.getModulePath(targetModule);
    
    if(!modulePath.exists()) {
        print("error: build module for target '" + target + "' not found at: " + modulePath);
    }

    
    if(options.spawn) {

        // TODO: Pass through additional command line arguments
        
        var cmd = "narwhal " + modulePath + " --package " + name;
        
        print("Running: " + cmd);
        
        OS.system(cmd);

    } else {
        
        // TODO: Pass through additional command line arguments
        
        require(modulePath.valueOf()).main({
            "package": name
        });
    }
});
