
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };



var system = require("system");
var fs = require("file");
var json = require("json");
var http = require("http");
var zip = require("zip");
var util = require("util");
var md5 = require("md5");
var struct = require("struct");
var URI = require("uri");
var CATALOG = require("./catalog");
var tusk = require("./tusk");
var tuskUtil = require("./util");
var manifest = require("./manifest");


var Package = exports.Package = function (uri) {
    if (!(this instanceof exports.Package))
        return new exports.Package(uri);

    if(uri instanceof fs.Path) {
        uri = "file://" + uri;
    }
    
    uri = tuskUtil.normalizeURI(uri, {allow: ["file", "http", "tusk"]});
    
    this.uri = URI.parse(uri);
    this.locked = false;

    if((this.uri.protocol=="http" ||
        (this.uri.protocol=="file" && fs.Path(this.uri.directory).isDirectory())) &&
       !/.zip$/.test(this.uri.file)) {
        throw "only zipped packages with a 'zip' extension are supported";
    }
}

Package.prototype.getPath = function() {
    
    if(!this.path) {
    
        if(this.uri.protocol=="file") {
            this.path = fs.Path(this.uri.path);
        } else
        if(this.uri.protocol=="tusk") {
            
            var catalog = CATALOG.getCatalog(this.uri.domain);
            if(!catalog.exists()) {
                throw "no planet catalog found with name: " + this.uri.domain;
            }
            
            if(!catalog.hasPackage(this.uri.file)) {
                throw "planet catalog '" + this.uri.domain + "' does not contain package with name: " + this.uri.file;
            }
            
            var pkg = catalog.getPackage(this.uri.file);
            if(!pkg.exists()) {
                throw "package not found in catalog or origin of catalog: " + catalog.getPath();                
            }
            
            // Now that we have a concrete path to the package source we can
            // use that path for our own package.
            this.path = pkg.getPath();
            // the originCatalog is used to resolve dependencies for this package
            this.originCatalog = pkg.originCatalog;
            
            // Since we are loading a remote package (external to our sea) we need to lock it
            // to prevent modifications.
            this.locked = true;

        } else
        if(this.uri.protocol=="http") {
            
            var key = struct.bin2hex(md5.hash(this.uri.url));
            var packagePath = tusk.getCacheDirectory().join(key);
            if(!packagePath.exists()) {
                
                var zipFile = fs.Path(packagePath+".zip");
                if(zipFile.exists()) {
                    zipFile.remove();
                }
    
                print("downloading: " + this.uri.url);
    
                zipFile.write(http.read(this.uri.url, 'b'), 'b');
                
                if(!zipFile.exists() || zipFile.size()==0) {
                    throw "error downloading package from: " + this.uri.url;
                }
    
                new zip.Unzip(zipFile).forEach(function (entry) {
                    if (entry.isDirectory())
                        return;
                    var parts = fs.split(entry.getName());
                    parts.shift(); // name-project-comment ref dirname
                    var path = packagePath.join(fs.join.apply(null, parts));
                    path.dirname().mkdirs();
                    path.write(entry.read('b'), 'b');
                });
                
                if(!packagePath.exists() || !packagePath.isDirectory()) {
                    throw "error extracting zip file: " + zipFile;
                }
            }
    
            this.path = packagePath;
            
            // Since we are dealing with a downloaded package we need to lock it
            // to prevent modifications.
            this.locked = true;
        }    
    }
    return this.path;
}

Package.prototype.exists = function() {
    var path = this.getPath();
    return (path.exists() && path.glob('**').length>0);
}

Package.prototype.validate = function() {

    if(!this.exists()) {
        return false;
    }

    var path = this.getPath();

    if(!path.join("package.json").exists()) {
        return false;
    }
    
    return true;
}

Package.prototype.save = function() {
    
    if(this.locked) {
        throw "package is locked and cannot be modified";
    }
    
    this.getManifest().save();
}

Package.prototype.create = function(name) {
    
    if(this.exists()) {
        throw "directory not empty";
    }
    
    var manifest = this.getManifest();
    
    manifest.manifest = {
        name: name
    }
    
    this.validate();
    this.save();
}

Package.prototype.getManifest = function() {
    if(!this.manifest) {
        this.manifest = manifest.Manifest(this.getPath().join("package.json"));
    }
    return this.manifest;
}

Package.prototype.getOriginCatalog = function() {
    if(!this.originCatalog) {
        return null;
    }
    return this.originCatalog;
}

Package.prototype.getName = function() {
    return this.getManifest().manifest.name;    
}

Package.prototype.getOriginInfo = function() {
    var info = {};
    info.url = this.uri.url;
    return info;
}

Package.prototype.getPackagesPath = function(name) {
//    var manifest = this.getManifest();
    // TODO: check manifest for alternative package path
    return this.getPath().join("packages", name);
}

Package.prototype.getDependencies = function(catalog) {
    var dependencies = [],
        names = this.getManifest().getDependencyNames();
    names.forEach(function(name) {
        dependencies.push(catalog.getPackage(name));
    });
    return dependencies;
}


/**
 * Load a package meta object from the sea (which is comprised
 * of the sea catalog and any planet catalogs referenced in the
 * sea catalog).
 */
exports.getPackage = function(name) {
    
    // first check the sea catalog
    var pkg = CATALOG.getSeaCatalog().getPackage(name);
    
dump(pkg);    
        
}
