
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var system = require("system");
var fs = require("file");
var json = require("json");
var util = require("util");
var tusk = require("./tusk");



var Manifest = exports.Manifest = function (path) {
    if (!(this instanceof exports.Manifest))
        return new exports.Manifest(path);
    this.path = path;
    this.manifest = (path.exists())?json.decode(path.read({charset:"utf-8"})):{};
}

Manifest.prototype.exists = function() {
    return this.path.exists();
}

Manifest.prototype.save = function() {
    this.path.dirname().mkdirs();
    this.path.write(
        json.encode(this.manifest, null, 4),
        {charset: 'utf-8'}
    );
}


Manifest.prototype.addDependency = function(name) {
    
    if(this.isDependency(name)) {
        throw "dependency already exists";
    }
    
    if(!util.has(this.manifest, "dependencies")) {
        this.manifest.dependencies = [];
    }
    
    this.manifest.dependencies.push([name]);
    this.save();
}

Manifest.prototype.removeDependency = function(name) {
    
    if(!this.isDependency(name)) {
        throw "dependency not found";
    }
    
    this.manifest.dependencies = this.manifest.dependencies.filter(function(dependency) {
        return !(dependency[0]==name)
    });
    
    this.save();
}

Manifest.prototype.isDependency = function(name) {

    if(!util.has(this.manifest, "dependencies")) {
        return false;
    }
    
    var found = false;
    this.manifest.dependencies.forEach(function(dependency) {
        if(dependency[0]==name) {
            found = true;
            return false;
        }
    });
        
    return found;    
}

Manifest.prototype.getDependencyNames = function() {
    if(!util.has(this.manifest, "dependencies")) {
        return [];
    }
    var names = [];
    this.manifest.dependencies.forEach(function(dependency) {
        names.push(dependency[0]);
    });
    return names;
}
