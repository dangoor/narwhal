
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
var tusk = require("./tusk");
var manifest = require("./manifest");



var Package = exports.Package = function (uri) {
    if (!(this instanceof exports.Package))
        return new exports.Package(uri);
    
    this.uri = URI.parse(uri);
    
    if(this.uri.protocol!="file" && this.uri.protocol!="http") {
        throw "package uri protocol not supported: "+this.uri.protocol;
    }

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
        }    
    }
    return this.path;
}

Package.prototype.exists = function() {
    return this.getPath().exists();
}

Package.prototype.validate = function() {

    if(!this.exists())
        return false;

    var path = this.getPath();

    if(!path.join("package.json").exists()) {
        return false;
    }
    
    return true;
}

Package.prototype.getManifest = function() {
    if(!this.manifest) {
        this.manifest = manifest.Manifest(this.getPath().join("package.json"));
    }
    return this.manifest;
}

Package.prototype.getName = function() {
    return this.getManifest().manifest.name;    
}
