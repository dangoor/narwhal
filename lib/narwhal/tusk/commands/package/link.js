
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


/**
 * Example usage:
 * 
 *     tusk add-package 
 *     tusk add-package ./path/to/package
 *     tusk add-package /path/to/package
 *     tusk add-package file://
 *     tusk add-package file://./path/to/package
 *     tusk add-package file:///path/to/package
 */

var util = require('util');
var fs = require('file');
var PACKAGE = require('../../package');
var CATALOG = require('../../catalog');
var tuskUtil = require("../../util");
var args = require('args');

var parser = exports.parser = new args.Parser();

parser.option('-f', '--force', 'force')
    .bool()
    .help('Replace package if it already exists in catalog');

parser.option('--catalog', 'catalog')
    .set()
    .help('The optional planet catalog to link the package into. If omitted package will be linked into the sea catalog.');

parser.help('Link a package into a catalog.');

parser.helpful();


parser.action(function (options) {

    var uri;
    if(options.args.length && !/^-/.test(options.args[0])) {
        uri = options.args.shift();
    } else {
        uri = fs.cwd().absolute();
    }
    uri = tuskUtil.normalizeURI(uri, {allow: ["file"]});

    var pkg = PACKAGE.Package(uri);
    
    if(!pkg.exists()) {
        print("error: package not found: " + uri);
        return;
    }
    
    if(!pkg.validate()) {
        print("error: package does not appear valid" + pkg.getPath());
        return;
    }
    
    var catalog = CATALOG.getCatalog(options.catalog);
    
    if(catalog.hasPackage(pkg)) {

        if(options.force) {
            
            catalog.removePackage(pkg);

            print("Removed existing package: " + pkg.getName());    
            
        } else {
            print("error: package already exists in catalog: " + pkg.getName());
            return;
        }
    }

    catalog.addPackage(pkg, {
        installMethod: "link"
    });

    print("Linked package '"+ uri +"' to package name '" + pkg.getName() + "' in catalog: " + catalog.getPath());    
});
