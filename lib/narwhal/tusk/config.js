
var system = require("system");
var fs = require("file");
var json = require("json");
var util = require("util");


var Config = function(type) {

    var impl = function (path) {
        if (!(this instanceof exports[type]))
            return new exports[type](path);
        this.path = path;
        this.config = (path.exists())?json.decode(path.read({charset:"utf-8"})):{};
    }

    impl.prototype.exists = function() {
        return this.path.exists();
    }
        
    impl.prototype.save = function() {
        this.path.dirname().mkdirs();
        this.path.write(
            json.encode(this.config, null, 4),
            {charset: 'utf-8'}
        );
    }
    
    return impl;
};


var TuskConfig = exports.TuskConfig = Config("TuskConfig");


TuskConfig.prototype.addSea = function(path) {

    if(!util.has(this.config,"seas")) {
        this.config.seas = [];
    }

    if(this.config.seas.indexOf(path)>-1) {
        return false;
    }

    this.config.seas.push(path);
    
    this.save();
    
    return true;
}
