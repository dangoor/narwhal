
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var FILE = require("file");
var UTIL = require("util");
var CONFIG = require("./config");
var TUSK = require("./tusk");
var SEA = require("./sea");
var PACKAGE = require("./package");
var CATALOG = require("./catalog");
var MD5 = require("md5");
var URI = require("uri");
var HTTP = require("http");
var ZIP = require("zip");
var STRUCT = require("struct");



exports.Planet = function (planetPath) {

    // PRIVATE
    
    if(!(planetPath instanceof FILE.Path)) {
        planetPath = FILE.Path(planetPath);
    }
    
    var config = getConfig();
    
    
    // PUBLIC

    var Planet = {};
    
    Planet.exists = function() {
        return (planetPath.exists() && planetPath.glob('*').length>0);
    }
    
    Planet.getPath = function() {
        return planetPath;
    }

    Planet.getConfig = function() {
        return config;
    }

    Planet.init = function() {
        if(Planet.exists()) {
            throw "directory not empty: " + planetPath;
        }
        planetPath.mkdirs();
        config.save();
    }
    
    Planet.destroy = function(prefixPath) {
        if(!prefixPath || !prefixPath.valueOf() || 
           planetPath.valueOf().substr(0,prefixPath.valueOf().length)!=prefixPath.valueOf()) {
            throw "sanity check failed for prefixPath: " + prefixPath;
        }
        planetPath.rmtree();
    }
    
    Planet.newSea = function(path) {
        var sea = SEA.Sea(path);
        sea.setPlanet(Planet);
        return sea;
    }

    Planet.addSea = function(sea) {
        getConfig().addSea(sea.getPath());
    }

    Planet.getSeas = function() {
        if(!config.exists() || !UTIL.has(config.config, "seas")) {
            return [];
        }
        
        var seas = [];
        config.config.seas.forEach(function(path) {
            seas.push(SEA.Sea(path));
        });
        return seas;
    }
    
    Planet.getSeaForSelector = function(selector) {
        var path;
        // check if we have a numeric sea number
        if( selector+1 > 1 ) {
            var list = Planet.getSeas();
            if(selector>=1 && selector <= list.length) {
                return list[selector-1];
            }
        } else
        // check if we have a sea path
        if((path = FILE.Path(selector)) && path.exists()) {
            return SEA.Sea(path);
        } else {
            var list = Planet.getSeas();
            for(  var i=0 ; i<list.length ; i++ ) {
                if(list[i].getName()==selector) {
                    return list[i];
                }
            }
        }
        return null;
    }
    
    Planet.getCacheDirectory = function() {
        var path = planetPath.join("cache");
        path.mkdirs();
        return path;
    }
    
    Planet.getCatalog = function(selector) {

        if(!selector) {
            return TUSK.getActive().getSea().getCatalog();
        } else
        if(selector=="narwhal") {
            return CATALOG.Catalog(TUSK.getNarwhalHomePath().join("catalog.json"));
        }
                
        // TODO: get named catalog or download it
//        var uri = URI.parse(selector);
        throw new TUSK.TuskError("TODO: get named catalog or download it");
//        return Catalog(tusk.getPlanetTuskDirectory().join(name + ".catalog.json"), name);
    }
    
    
    Planet.getPackage = function(locator) {

        // TODO: Check for package or catalog overlays

        if(locator.getType()=="catalog") {
            
            var url = locator.getUrl(),
                revision = locator.getRevision();
    
            // before we download the catalog let's check if it is the
            // same catalog that our active sea is using.
            
            var catalog = TUSK.getActive().getSea().getCatalog(),
                originInfo = catalog.getOriginInfo();

            if(UTIL.has(originInfo, "locate") && originInfo.locate==url) {
                // the catalog we are trying to reference matches the sea catalog.
                // we are going to use the sea catalog to locate the package
                // instead of downloading the catalog.
                // a sea catalog provides a means to reference packages included
                // in a master package/sea individually.
                
                // we need to update the revision we are seeking to "source" in
                // order to find the included (in the sea) package.
                revision = "source";
            } else {
    
                var key = STRUCT.bin2hex(MD5.hash(url));
                var catalogPath = Planet.getCacheDirectory().join(key);
                if(!catalogPath.exists()) {
        
                    TUSK.getActive().getTheme().newMessage({
                        "url": url,
                        "path": catalogPath.valueOf(),
                        "note": "Downloading '{url}' to: {path}"
                    }, "{note}", "note").finalize();
        
                    catalogPath.write(HTTP.read(url, 'b'), 'b');
        
                    if(!catalogPath.exists() || catalogPath.size()==0) {
                        throw "error downloading catalog from: " +url;
                    }
                }
        
                catalog = CATALOG.Catalog(catalogPath);
            }
            
            var name = locator.getPackageName();
            
            if(!catalog.hasPackage(name)) {
                throw "package '" + name + "' not found in catalog";
            }

            return catalog.getPackage(name, revision);

        } else        
        if(locator.getType()=="locate") {

            var url = locator.getUrl();
    
            var key = STRUCT.bin2hex(MD5.hash(url));
            var packagePath = Planet.getCacheDirectory().join(key);
            if(!packagePath.exists()) {
                var zipFile = FILE.Path(packagePath + ".zip");
                if(zipFile.exists()) {
                    zipFile.remove();
                }
    
                TUSK.getActive().getTheme().newMessage({
                    "url": url,
                    "path": zipFile.valueOf(),
                    "note": "Downloading '{url}' to: {path}"
                }, "{note}", "note").finalize();
    
                zipFile.write(HTTP.read(url, 'b'), 'b');
                
                if(!zipFile.exists() || zipFile.size()==0) {
                    throw "error downloading package from: " + url;
                }
    
                TUSK.getActive().getTheme().newMessage({
                    "path": packagePath.valueOf(),
                    "note": "Extracting to: {path}"
                }, "{note}", "note").finalize();
    
                new ZIP.Unzip(zipFile).forEach(function (entry) {
                    if (entry.isDirectory())
                        return;
                    var parts = FILE.split(entry.getName());
                    parts.shift(); // name-project-comment ref dirname
                    var path = packagePath.join(FILE.join.apply(null, parts));
                    path.dirname().mkdirs();
                    path.write(entry.read('b'), 'b');
                });
                
                if(!packagePath.exists() || !packagePath.isDirectory()) {
                    throw "error extracting zip file: " + zipFile;
                }
            }
            
            var subPath = locator.getPath();
            if(subPath) {
                packagePath = packagePath.join(subPath);
                if(!packagePath.exists()) {
                    throw "no package found at sub path: " + packagePath;
                }
            }

            return PACKAGE.Package(packagePath);
        }
    }

    return Planet;
    
    
    // PRIVATE
    
    function getConfig() {
        return CONFIG.TuskConfig(planetPath.join("tusk.json"));
    }
}

