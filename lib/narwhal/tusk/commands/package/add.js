
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
 *     tusk app-package http://domain.com/path/package.zip
 */

var UTIL = require('util');
var FILE = require('file');
var URI = require('uri');
var PACKAGE = require('../../package');
var CATALOG = require('../../catalog');
var LOCATOR = require('../../locator');
var SEA = require('../../sea');
var TUSK_UTIL = require("../../util");
var ARGS = require('args');

var parser = exports.parser = new ARGS.Parser();

parser.help('Add a package to a sea or catalog. Requires an active sea or --catalog');

parser.arg("uri");
parser.args("package");

parser.option('-f', '--force', 'force')
    .bool()
    .help('Replace package if it already exists in catalog');

parser.option('--catalog', 'catalog')
    .set()
    .help('The optional planet catalog to add the package to. If omitted package will be added to the sea catalog.');

parser.option('--revision')
    .set()
    .help('The revision of the package to be used.');

parser.helpful();


var action = function (options, parentOptions, context) {

    var tusk = context.tusk,
        planet = tusk.getPlanet(),
        theme = tusk.getTheme();

    var uri;
    if(options.args.length && !/^-/.test(options.args[0])) {
        uri = options.args.shift();
    } else {
        uri = FILE.cwd().absolute();
    }
    
    uri = URI.parse(TUSK_UTIL.normalizeURI(uri, {allow: ["file", "http"]}));
    

    // build a locator

    var info;
    if(uri.file=="catalog.json") {
        if(!options.args[1]) {
            theme.newMessage({
                "message": "No package specified for catalog"
            }, "{message}", "error").finalize();
            return;
        }
        info = {
            "catalog": uri.url,
            "package": options.args[1]
        };
    } else {
        info = {
            "locate": uri.url
        };
    }
    info.revision = options.revision || "latest";
    
    var locator = LOCATOR.Locator(info);


    // get a reference to the package
    // download it if necessary
    var pkg = planet.getPackage(locator);
    
    if(!pkg.validate()) {
        theme.newMessage({
            "path": pkg.getPath(),
            "message": "Package not valid"
        }, "{message}: {path}", "error").finalize();
        return;
    }
    
    var packageName = pkg.getName();

    // update locator with package name if applicable
    if(!UTIL.has(info, "package")) {
        info["package"] = packageName;
        locator = LOCATOR.Locator(info);
    }
    

    var message;
    
    // see if we need to add package to a catalog or as a dependency to the sea
    if(options.catalog) {
        // add to catalog

        var catalog = planet.getCatalog(options.catalog);

        message = theme.newMessage({
            "locator": locator.toString(),
            "catalogPath": catalog.getPath().valueOf(),
            "message": "Adding package to catalog"
        }, "Adding package '\0magenta({locator}\0)' to catalog: {catalogPath}").finalize();
        
        message.startGroup();
                
         // check if package already exists
        if(catalog.hasPackage(packageName)) {
            if(options.force) {
                catalog.removePackage(packageName);
                theme.newMessage({
                    "name": packageName,
                    "note": "Removed existing package"
                }, "{note}: {name}", "note").finalize();
            } else {
                theme.newMessage({
                    "name": packageName,
                    "message": "Package already exists"
                }, "{message}: {name}", "error").finalize();
                return packageName;
            }
        }

        catalog.addPackage(locator);
        
    } else {
        // add as dependency
        
        var seaPkg = tusk.getSea().getSeaPackage(),
            seaPkgManifest = seaPkg.getManifest();

        message = theme.newMessage({
            "locator": locator.toString(),
            "name": packageName,
            "packagePath": seaPkg.getPath(),
            "message": "Added package as dependency"
        }, "Adding package '\0magenta({locator}\0)' as dependency to package: {packagePath}").finalize();

        message.startGroup();

        // check if dependency already exists
        if(seaPkgManifest.isDependency(packageName)) {
            if(options.force) {
                seaPkgManifest.removeDependency(packageName);
                theme.newMessage({
                    "name": packageName,
                    "note": "Removed existing dependency"
                }, "{note}", "note").finalize();
            } else {
                theme.newMessage({
                    "path": seaPkg.getPath(),
                    "message": "Package already exists as dependency"
                }, "{message} in package: {path}", "error").finalize();
                return packageName;
            }
        }

        seaPkgManifest.addDependency(packageName, locator);
    }
    
    message.endGroup();

    theme.newMessage({
        "note": "Done"
    }, "{note}", "note").finalize();
    
    return packageName;
}

parser.action(action);

