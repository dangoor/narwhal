
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var util = require('util');
var fs = require('file');
var CATALOG = require('../../catalog');
var PACKAGE = require('../../package');
var SEA = require('../../sea');
var args = require('args');

var parser = exports.parser = new args.Parser();

parser.option('--delete', 'delete')
    .bool()
    .help('Delete the package source from the sea if a sea is active.');

parser.option('--catalog', 'catalog')
    .set()
    .help('The optional planet catalog to remove the package from. If omitted package will be removed from the sea catalog.');

parser.help('Remove a package from a catalog.');

parser.helpful();


parser.action(function (options) {
    
    var name = options.args[0];
    
    var catalog = CATALOG.getCatalog(options.catalog);
    
    if(!catalog.hasPackage(name)) {
        print("error: package does not exist in catalog");
        return;
    }

    var pkg = catalog.getPackage(name);

    catalog.removePackage(name);

    print("Removed package '"+ name +"' from catalog: " + catalog.getPath());    

    var sea = SEA.getActive();
    
    if(options["delete"]) {
        var path = sea.getPackagesPath().join(pkg.getName());
        PACKAGE.Package(path).uninstall(sea);
    }
    
    var manifest = sea.getPackageManifest();
    if(manifest.isDependency(name)) {
        manifest.removeDependency(name);
        print("Removed package '" + name + "' as a dependency to: " + catalog.getPath());
    } else {
        print("Package '" + name + "' is not a dependency to: " + catalog.getPath());
    }
});
