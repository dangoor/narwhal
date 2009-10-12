
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

parser.option('--alias')
    .set()
    .help('Optional alias for the package dependency.');

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
        if(!options.args[0]) {
            theme.newMessage({
                "message": "No package specified for catalog"
            }, "{message}", "error").finalize();
            return;
        }
        info = {
            "catalog": uri.url,
            "package": options.args[0]
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
    

    var message,
        alias = options.alias || packageName;
    
    // see if we need to add package to a catalog or as a dependency to the sea
    if(options.catalog) {
        // add to catalog

        var catalog = planet.getCatalog(options.catalog);

        message = theme.newMessage({
            "locator": locator.toString(),
            "name": alias,
            "catalogPath": catalog.getPath().valueOf(),
            "message": "Adding package to catalog"
        }, "Adding package '\0magenta({locator}\0)' with alias '{name}' to catalog: {catalogPath}").finalize();
        
        message.startGroup();

         // check if package already exists
        if(catalog.hasPackage(alias, info.revision)) {
            if(options.force) {
                catalog.removePackage(alias, info.revision);
                theme.newMessage({
                    "name": alias,
                    "note": "Removed existing package"
                }, "{note}: {name}", "note").finalize();
            } else {
                theme.newMessage({
                    "name": alias,
                    "message": "Package already exists"
                }, "{message}: {name}", "error").finalize();
                return;
            }
        }

        catalog.addPackage(alias, info.revision, locator);
        
    } else {
        // add as dependency
        
        var targetPkg,
            targetPkgManifest;
        
        if(parentOptions["package"]) {
            targetPkg = tusk.getSea().getPackage(parentOptions["package"]);
            if(!targetPkg || !targetPkg.exists()) {
                theme.newMessage({
                    "path": targetPkg.getPath(),
                    "message": "Package does not exist"
                }, "{message} at: {path}", "error").finalize();
                return;
            }
            if(!targetPkg.validate()) {
                theme.newMessage({
                    "path": targetPkg.getPath(),
                    "message": "Package not valid"
                }, "{message}: {path}", "error").finalize();
                return;
            }
        } else {
            targetPkg = tusk.getSea().getSeaPackage();
        }
        targetPkgManifest = targetPkg.getManifest();

        message = theme.newMessage({
            "locator": locator.toString(),
            "name": alias,
            "packagePath": targetPkg.getPath(),
            "message": "Added package as dependency"
        }, "Adding package '\0magenta({locator}\0)' with alias '{name}' as dependency to package: {packagePath}").finalize();

        message.startGroup();

        // check if dependency already exists
        if(targetPkgManifest.isDependency(alias)) {
            if(options.force) {
                targetPkgManifest.removeDependency(alias);
                theme.newMessage({
                    "name": alias,
                    "note": "Removed existing dependency"
                }, "{note}: {name}", "note").finalize();
            } else {
                theme.newMessage({
                    "name": alias,
                    "message": "Package already exists as dependency"
                }, "{message}: {name}", "error").finalize();
                return;
            }
        }

        targetPkgManifest.addDependency(alias, locator);
    }
    
    message.endGroup();

    theme.newMessage({
        "note": "Done"
    }, "{note}", "note").finalize();
    
    return alias;
}

parser.action(action);

