
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var system = require("system");
var fs = require("file");
var json = require("json");
var util = require("util");
var URI = require("uri");
var tusk = require("./tusk");
var tuskUtil = require("./util");

var PACKAGE = require("./package");



var Catalog = exports.Catalog = function (uri) {
    if (!(this instanceof exports.Catalog))
        return new exports.Catalog(uri);

    uri = tuskUtil.normalizeURI(uri, {allow: ["file", "http"]});

    this.uri = URI.parse(uri);
}

Catalog.prototype.getPath = function() {
    if(!this.path) {
        if(this.uri.protocol=="file") {
            this.path = fs.Path(this.uri.path);
        } else
        if(this.uri.protocol=="http") {
            
throw "TODO: download catalog";

        }    
    }
    return this.path;
}

Catalog.prototype.getCatalog = function() {
    if(!this.catalog) {
        if(!this.exists()) {
            throw "catalog not initialized";
        }
        this.catalog = json.decode(this.getPath().read({charset:"utf-8"}));
        this.validate();
    }
    return this.catalog;
}

Catalog.prototype.create = function(name) {
    if(this.catalog) {
        throw "Catalog already exists";
    }
    this.catalog = {name: name};
    this.validate();
    this.save();
}

Catalog.prototype.exists = function() {
    return this.getPath().exists();
}

Catalog.prototype.validate = function() {
    var catalog = this.getCatalog();
    if(!util.has(catalog, "name")) {
        return false;
    }
    var parts = catalog.name.split(".");
    if(parts[0]!="localhost" && URI.TLDS.indexOf(parts[0])==-1) {
        return false;
    }
    return true;
}

Catalog.prototype.save = function() {
    var path = this.getPath();
    path.dirname().mkdirs();
    path.write(
        json.encode(this.getCatalog(), null, 4),
        {charset: 'utf-8'}
    );
}

Catalog.prototype.getName = function() {
    return this.getCatalog().name;
}

Catalog.prototype.getPackageCount = function() {
    var catalog = this.getCatalog();
    if(!util.has(catalog, "packages")) {
        return 0;
    }
    return util.len(catalog.packages);
}

Catalog.prototype.addPackage = function(pkg, originInfo) {
    
    if(this.hasPackage(pkg)) {
        throw "package already listed in catalog";
    }

    var catalog = this.getCatalog();
    
    if(!util.has(catalog, "packages")) {
        catalog.packages = {};
    }
    
    var info = {
        "manifest": pkg.getManifest().manifest
    }

    info.origin = pkg.getOriginInfo();
    util.update(info.origin, originInfo);
    
    catalog.packages[pkg.getName()] = info;
    
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

    var catalog = this.getCatalog();
    
    delete catalog.packages[name];
    
    this.save();
}

Catalog.prototype.hasPackage = function(pkg) {

    var catalog = this.getCatalog();

    if(!util.has(catalog, "packages"))
        return false;
    
    var name = pkg;
    if(pkg instanceof PACKAGE.Package) {
        name = pkg.getName();
    }
       
    return util.has(catalog.packages, name);
}

Catalog.prototype.getOrigin = function() {
    
    // ensure we have all default keys set
    var origin = {
        url: ""
    }
    
    util.update(origin, this.getCatalog().origin);
    
    return origin;
}

Catalog.prototype.assembleOriginInfo = function() {
    var info = {};
    info.name = this.getName();
    info.url = this.uri.url;
    return info;
}

Catalog.prototype.replaceWith = function(newCatalog) {
    
    var catalog = this.getCatalog();
    
    var name = catalog.name;
    
    util.update(catalog, newCatalog.getCatalog());
    
    catalog.name = name;    
    catalog.origin = newCatalog.assembleOriginInfo();
    
    this.save();
}



exports.getNarwhalCatalogPath = function() {
    return fs.Path(system.env["NARWHAL_HOME"]).join("catalog.json");
}

exports.getSeaCatalogPath = function() {
    return tusk.getTuskDirectory().join("catalog.json");
}

exports.getSeaCatalog = function() {
    return Catalog(exports.getSeaCatalogPath());
}

exports.getPlanetCatalog = function(name) {
    return Catalog(tusk.getPlanetTuskDirectory().join(name + ".catalog.json"), name);
}

exports.getCatalog = function(name) {
    if(!name)
        return exports.getSeaCatalog();
    return exports.getPlanetCatalog(name);    
}

exports.list = function() {
    var info = {
        sea: [ exports.getSeaCatalogPath() ],
        planet: [],
        narwhal: [ exports.getNarwhalCatalogPath() ]
    };
    
    var planetCatalogs = tusk.getPlanetTuskDirectory().glob("*.catalog.json");
    planetCatalogs.forEach(function(path) {
        info.planet.push(path);
    });
    
    return info;
}
