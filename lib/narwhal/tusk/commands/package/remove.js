
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var util = require('util');
var fs = require('file');
var CATALOG = require('../../catalog');
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

    this.print("\0red(TODO: remove dependencies if not used by any other package\0)");

    var pkg = catalog.getPackage(name);

    catalog.removePackage(name);

    print("Removed package '"+ name +"' from catalog: " + catalog.getPath());    

    if(!catalog.isSeaCatalog) {
        return;
    }
    
    if(options["delete"]) {
        var path = pkg.getPath();
        if(fs.match(path, SEA.getActive().getPackagesPath().join("**"))) {
            
            // NOTE: path.isLink() does not work with rhino on Mac OS X
            try {
                // try and remove it as a link first
                // if it is a directory this will fail
                // we cannot call path.rmtree() without testing this first as
                // it will delete the tree the link points to
                path.remove();
            } catch(e) {
                if(path.isDirectory()) {
                    path.rmtree();
                }
            }
        }
    }
    
    var manifest = SEA.getActive().getPackageManifest();
    if(manifest.isDependency(name)) {
        manifest.removeDependency(name);
        print("Removed package '" + name + "' as a dependency to: " + catalog.getPath());
    } else {
        print("Package '" + name + "' is not a dependency to: " + catalog.getPath());
    }
});
