
var fs = require("file");
var URI = require("uri");

exports.normalizeURI = function(uri, options) {

    if(uri) {
        if(/^file:\/\//.test(uri)) {
            uri = "file://" + fs.path(uri.substr(7)).absolute();
        } else
        if(/^[^:]+:\/\//.test(uri)) {
            // protocol prefix already present
        } else {
            uri = "file://" + fs.path(uri).absolute();
        }
    } else {
        uri = "file://" + fs.cwd().absolute();
    }
    
    var protocol = URI.parse(uri).protocol;
    if(options.allow.indexOf(protocol)==-1) {
        throw "url protocol not supported: " + protocol;
    }
    
    return uri;    
}
