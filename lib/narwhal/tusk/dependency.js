
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var FILE = require("file");
var UTIL = require("util");
var URI = require("uri");
var PACKAGE = require("./package");
var CATALOG = require("./catalog");
var LOCATOR = require("./locator");
var PACKAGES = require("packages");
var TUSK = require("./tusk");


exports.Dependency = function (sea, parentPkg, info) {

    // PRIVATE
    
    var name,       // name or alias of a package
        id,         // top-level id of a package
        path,       // install path for the package
        locator;    // origin/source info
    
    var seaCatalog = sea.getCatalog();
    
    // ["<alias>", <locator>]    
    if(UTIL.isArrayLike(info)) {
        name = info[0];
        locator = LOCATOR.Locator(info[1]);
        
        // check if the locator is a catalog pointer and the catalog it is
        // pointing to is the same as the active sea catalog.
        // if it is we want to reference the package included in the sea rather
        // than set up a remote dependency
        
        var originInfo = seaCatalog.getOriginInfo();
        if(locator.getType()=="catalog" &&
           UTIL.has(originInfo, "locate") && originInfo.locate==locator.getUrl()) {
            
            name = null;
            info = locator.getPackageName();
        
        } else {
            id = locator.getId();
            path = sea.getDependenciesPath().join(locator.getId());
        }
    }
        
    if(!name) {
        name = id = info;
        
        // for backwards compatibility we check if the dependency comes from
        // the narwhal catalog
        var narwhalCatalog = sea.getNarwhalCatalog();
        if(narwhalCatalog.hasPackage(name)) {
            locator = LOCATOR.Locator({
                "catalog": narwhalCatalog.getPath().valueOf(),
                "package": name,
                "revision": "latest"
            });
        } else {
            locator = LOCATOR.Locator({
                "locate": "file://" + parentPkg.getPackagesPath().join(name).valueOf(),
                "package": name,
                "revision": "latest"
            });
        }

        // local dependency - lookup in catalog
        if(seaCatalog.hasPackage(name)) {
            // all local dependencies must be looked up with revision "source"
            path = seaCatalog.getPackage(name, "source").getPath();
        } else
        // lookup in installed packages
        if(UTIL.has(PACKAGES.catalog, name)) {
            path = PACKAGES.catalog[name].directory;
        } else {
            // if not found in catalog we assume the path relative to the parent package
            path = parentPkg.getPackagesPath().join(name);                
        }
    }
    
    // PUBLIC

    var Dependency = {};
    
    Dependency.getName = function() {
        return name;
    }
    Dependency.getId = function() {
        return id;
    }
    Dependency.getLocator = function() {
        return locator;
    }
    Dependency.getPackage = function() {
        var pkg = PACKAGE.Package(path);
        pkg.setSea(sea);
        return pkg;
    }
    
    Dependency.install = function(owner, options) {

        print("install dependency " + this.name);    

    }

    return Dependency;
    
    
    // PRIVATE

}
