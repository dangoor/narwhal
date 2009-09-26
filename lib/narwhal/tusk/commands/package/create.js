
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var util = require('util');
var fs = require('file');
var PACKAGE = require('../../package');
var CATALOG = require('../../catalog');
var SEA = require('../../sea');
var args = require('args');

var parser = exports.parser = new args.Parser();

parser.help('Create a new package in the current sea.');

parser.helpful();


parser.action(function (options) {

    var sea = SEA.getActive();
    
    var name = options.args[0];
    if(!name) {
        print('error: no name provided');
        return;
    }
    
    var path = sea.getPackagesPath().join(name);
    
    var catalog = SEA.getActive().getCatalog();
    var pkg = PACKAGE.Package(path);
    if(pkg.exists()) {
        print("error: package already exists at: " + path);
        return;
    }

    if(catalog.hasPackage(pkg)) {
        print("error: package already exists in sea catalog");
        return;
    }
    
    pkg.create(name);
    
    catalog.addPackage(pkg, {
        url: "file://./" + catalog.getPath().relative(pkg.getPath()),
        installMethod: "none"
    });

    print("Created package at: " + path);
    print("Added package '"+ name +"' to sea catalog: " + catalog.getPath());
    
        
    var manifest = sea.getPackageManifest();
    if(!manifest.isDependency(name)) {
        manifest.addDependency(name);
        print("Added package '" + name + "' as a dependency to: " + catalog.getPath());
    } else {
        print("Package '" + name + "' is already a dependency to: " + catalog.getPath());
    }
});
