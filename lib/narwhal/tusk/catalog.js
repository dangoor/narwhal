
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var system = require("system");
var fs = require("file");
var json = require("json");
var util = require("util");
var tusk = require("./tusk");

var PACKAGE = require("./package");


var Catalog = exports.Catalog = function (path) {
    if (!(this instanceof exports.Catalog))
        return new exports.Catalog(path);
    this.path = path;
    this.catalog = (path.exists())?json.decode(path.read({charset:"utf-8"})):{};
}

Catalog.prototype.exists = function() {
    return this.path.exists();
}

Catalog.prototype.save = function() {
    this.path.dirname().mkdirs();
    this.path.write(
        json.encode(this.catalog, null, 4),
        {charset: 'utf-8'}
    );
}


Catalog.prototype.addPackage = function(pkg, originInfo) {
    
    if(this.hasPackage(pkg)) {
        throw "package already listed in catalog";
    }
    
    if(!util.has(this.catalog, "packages")) {
        this.catalog.packages = {};
    }
    
    var info = {
        "manifest": pkg.getManifest().manifest
    }

    info.origin = pkg.getOriginInfo();
    util.update(info.origin, originInfo);
    
    this.catalog.packages[pkg.getName()] = info;
    
    this.save();
}

Catalog.prototype.removePackage = function(pkg) {
    
    if(!this.hasPackage(pkg)) {
        throw "package not found in catalog";
    }
    
    var name = pkg;
    if(pkg instanceof PACKAGE.Package) {
        name = pkg.getName();
    }
    
    delete this.catalog.packages[name];
    
    this.save();
}

Catalog.prototype.hasPackage = function(pkg) {
    if(!util.has(this.catalog, "packages"))
        return false;
    
    var name = pkg;
    if(pkg instanceof PACKAGE.Package) {
        name = pkg.getName();
    }
       
    return util.has(this.catalog.packages, name);
}