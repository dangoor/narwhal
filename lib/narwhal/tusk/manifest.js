
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

