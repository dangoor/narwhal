
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var FILE = require("file");
var UTIL = require("util");
var URI = require("uri");

exports.normalizeURI = function(uri, options) {

    // TODO: if(uri instanceof URI.URI) { // does not work
    if(UTIL.has(uri, "url")) {
        uri = uri.url;
    }

    if(uri) {
        if(/^file:\/\//.test(uri)) {
            uri = "file://" + FILE.path(uri.substr(7)).absolute();
        } else
        if(/^[^:]+:\/\//.test(uri)) {
            // protocol prefix already present
        } else
        if(uri.substr(1)!="." && uri.split("/").length==1 && options.relativeFilePathsOnly) {
            return uri;
        } else {
            uri = "file://" + FILE.path(uri).absolute();
        }
    } else {
        uri = "file://" + FILE.cwd().absolute();
    }
    
    var protocol = URI.parse(uri).protocol;
    if(options.allow.indexOf(protocol)==-1) {
        throw "url protocol not supported: " + protocol;
    }
    
    return uri;    
}
