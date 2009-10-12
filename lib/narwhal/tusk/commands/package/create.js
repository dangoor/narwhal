
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var PACKAGE = require('../../package');
var LOCATOR = require('../../locator');
var ARGS = require('args');

var parser = exports.parser = new ARGS.Parser();

parser.help('Create a new package in the current sea.');

parser.helpful();

parser.action(function (options, parentOptions, context) {
    
    var tusk = context.tusk,
        sea = tusk.getSea(),
        theme = tusk.getTheme();
     
    var name = options.args[0];
    if(!name) {
        theme.newMessage({
            "message": "No package name provided"
        }, "{message}", "error").finalize();
        return;
    }
    
    var path = sea.getPackagesPath().join(name);
    
    var pkg = PACKAGE.Package(path);
    if(pkg.exists()) {
        theme.newMessage({
            "path": path.valueOf(),
            "message": "Package already exists"
        }, "{message} at path: {path}", "error").finalize();
        return;
    }
    
     var seaPkg = sea.getSeaPackage(),
         seaPkgManifest = seaPkg.getManifest();

    // check if dependency already exists
    if(seaPkgManifest.isDependency(name)) {
        theme.newMessage({
            "name": name,
            "path": seaPkg.getPath(),
            "message": "Package already exists as dependency"
        }, "Package '{name}' already exists as dependency in package: {path}", "error").finalize();
        return;
    }

    var catalog = sea.getCatalog();

    if(catalog.hasPackage(pkg, "latest")) {
        theme.newMessage({
            "path": catalog.getPath().valueOf(),
            "message": "Package already exists in sea catalog"
        }, "{message}: {path}", "error").finalize();
        return;
    }
    
    
    // create the package
    pkg.create(name);
    
    theme.newMessage({
        "name": name,
        "path": pkg.getPath().valueOf(),
        "message": "Created package"
    }, "Created package '{name}' at: {path}").finalize();
    
    
    // add package to sea catalog
    var locator = LOCATOR.Locator({
        "locate": "file://./packages/" + name,
        "package": name,
        "revision": "latest"
    });
    catalog.addPackage(name, "latest", locator);

    theme.newMessage({
        "name": name,
        "locator": locator,
        "revision": "latest",
        "catalogPath": catalog.getPath().valueOf(),
        "message": "Added package to sea catalog"
    }, "Added package '{name}' at revision '{revision}' with locator '{locator}' to sea catalog: {catalogPath}").finalize();

    
    // add package as a dependency to the sea package
    var url = catalog.getOriginInfo()["locate"];
    if(!url) {
        url = "file://./catalog.json";
    }
    locator = LOCATOR.Locator({
        "catalog": url,
        "package": name,
        "revision": "source"
    });
    seaPkgManifest.addDependency(name, locator);    
    
    theme.newMessage({
        "name": name,
        "locator": locator,
        "path": seaPkg.getPath().valueOf(),
        "message": "Added package to sea package"
    }, "Added package '{name}' with locator '{locator}' to sea package: {path}").finalize();

});
