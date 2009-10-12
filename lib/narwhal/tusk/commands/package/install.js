
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var UTIL = require("util");
var URI = require("uri");
var LOCATOR = require("../../locator");
var PACKAGE = require("../../package");
var TUSK_UTIL = require("../../util");
var ARGS = require("args");


var parser = exports.parser = new ARGS.Parser();

parser.help('Downloads and installs a package and its dependencies into the sea');

parser.args('package');

parser.option('-f', '--force', 'force')
    .bool()
    .help('Replace package if it already exists');

parser.option('--alias')
    .set()
    .help('Optional alias for the package dependency.');

parser.option('--add', 'add')
    .bool()
    .help('Add the package to the sea catalog if not already added.');

parser.helpful();

exports.install = function (options, parentOptions, context) {

    var tusk = context.tusk,
        sea = tusk.getSea(),
        planet = tusk.getPlanet(),
        theme = tusk.getTheme();


    var uri;
    if(options.args.length && !/^-/.test(options.args[0])) {
        uri = options.args.shift();
    } else {
        // no package name or URL provided. if -f is set
        // we install all missing dependencies for the sea
        if(options.force) {

            var message = theme.newMessage({
                "note": "Checking all dependencies for sea"
            }, "{note}", "note").finalize();

            message.startGroup();
            sea.forEachDependency(function(dependency) {
                pkg = dependency.getPackage();
                if(!pkg.exists()) {
                    pkg.install(dependency.getLocator());
                } else {
                    pkg.installDependencies();
                }
            });
            message.endGroup();
            
        } else {
            theme.newMessage({
                "message": "No URI or package name provided"
            }, "{message}", "error").finalize();
            theme.newMessage({
                "tip": "Use 'tusk package install -f' to install dependencies for sea"
            }, "TIP: {tip}", "info").finalize();
        }
        return;
    }
    
    
    // install a package into the sea keeping track of it in package.local.json
    // if a package is to be added to a sea permanently use "tusk package add ..."

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
    
    var targetPkg,
        targetPkgManifest;
    
    targetPkg = sea.getSeaPackage();
    targetPkgManifest = targetPkg.getLocalManifest();

    message = theme.newMessage({
        "locator": locator.toString(),
        "seaPath": sea.getPath(),
        "name": alias,
        "message": "Installing package"
    }, "Installing package '\0magenta({locator}\0)' with alias '{name}' into sea: {seaPath}").finalize();

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
    
    // now install the package
    
    var dependency = targetPkg.getDependency(alias);
    dependency.getPackage().install(dependency.getLocator(), {
        force: options.force,
        installBinaries: true
    });
}


parser.action(exports.install);
