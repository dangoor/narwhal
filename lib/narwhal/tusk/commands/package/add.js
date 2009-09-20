
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


/**
 * Example usage:
 * 
 *     tusk add-package 
 *     tusk add-package ./path/to/file
 *     tusk add-package /path/to/file
 *     tusk add-package file://
 *     tusk add-package file://./path/to/file
 *     tusk add-package file:///path/to/file
 *     tusk app-package http://domain.com/path/package.zip
 */

var util = require('util');
var fs = require('file');
var tusk = require('../../tusk');
var PACKAGE = require('../../package');
var args = require('args');

var parser = exports.parser = new args.Parser();

parser.option('-f', '--force', 'force')
    .bool()
    .help('Replace package if it already exists in catalog');

parser.option('--catalog', 'catalog')
    .set()
    .help('The optional planet catalog to add the package to. If omitted package will be added to the sea catalog.');

parser.help('Add a package to a catalog.');

parser.helpful();


parser.action(function (options) {
    
    var uri;
    if(options.args.length && !/^-/.test(options.args[0])) {
        uri = options.args.shift();
        if(/^http:\/\//.test(uri)) {
            // protocol prefix already present
        } else
        if(/^file:\/\//.test(uri)) {
            uri = "file://" + fs.path(uri.substr(7)).absolute();
        } else {
            uri = "file://" + fs.path(uri).absolute();
        }
    } else {
        uri = "file://" + fs.cwd().absolute();
    }

    var pkg = PACKAGE.Package(uri);
    
    if(!pkg.exists()) {
        print("error: package not found: " + uri);
        return;
    }
    
    if(!pkg.validate()) {
        print("error: package does not appear valid" + pkg.getPath());
        return;
    }
    
    var catalog = tusk.getCatalog(options.catalog);
    
    if(catalog.hasPackage(pkg)) {

        if(options.force) {
            
            catalog.removePackage(pkg);

            print("Removed existing package: " + pkg.getName());    
            
        } else {
            print("error: package already exists in catalog: " + pkg.getName());
            return;
        }
    }

    catalog.addPackage(pkg);

    print("Added package: " + pkg.getName());    

});


