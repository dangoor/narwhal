
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var UTIL = require("util");
var FILE = require("file");
var URI = require("uri");
var TUSK = require("./tusk");


exports.Locator = function (info) {

    // PRIVATE

    if(!info) {
        throw new TUSK.TuskError("no locator");        
    }
    if(typeof info == "string" || UTIL.isArrayLike(info)) {
        throw new TUSK.TuskError("locator is not an object: " + info);        
    }

    // locators:
    // {
    //   "catalog": "https://trustedcatalog.com/group/catalog.json",
    //   "package": "theBar"
    //   "revision": "3.8"
    // }
    // {
    //   "locate": ["https://trustedcatalog.com/group/theBaz-2.1.zip"],
    //   "package": "theBaz"
    //   "revision": "2.1"
    // }        
    if(!UTIL.has(info, "catalog") && !UTIL.has(info, "locate")) {
        throw new TUSK.TuskError("'catalog' nor 'locate' specified in locator");            
    }
    if(UTIL.has(info, "catalog") && UTIL.has(info, "locate")) {
        throw new TUSK.TuskError("'catalog' and 'locate' specified in locator");            
    }
    if(UTIL.has(info, "catalog") && !UTIL.has(info, "package")) {
        throw new TUSK.TuskError("'package' not specified in locator");            
    }
    if(!UTIL.has(info, "revision")) {
        throw new TUSK.TuskError("'revision' not specified in locator");            
    }

    var type,
        uri;
    if(UTIL.has(info, "catalog")) {
        type = "catalog";
        uri = URI.parse(info.catalog);
    } else
    if(UTIL.has(info, "locate")) {
        type = "locate";
        uri = URI.parse(info.locate);
    }
    if(!type) {
        throw "could not determine locator type";
    }
    
    // PUBLIC

    var Locator = {};
    
    Locator.getType = function() {
        return type;
    }
    Locator.getPackageName = function() {
        if(!UTIL.has(info, "package")) {
            return false;
        }
        return info["package"];
    }
    Locator.getPath = function() {
        if(!UTIL.has(info, "path")) {
            return false;
        }
        return info["path"];
    }
    Locator.getRevision = function() {
        return info["revision"];
    }
    Locator.getInfo = function() {
        return info;
    }
    Locator.isRelative = function() {
        return (uri.protocol=="file" && uri.domain.substr(0,1)==".");
    }
    Locator.getId = function() {
        return FILE.Path(uri.domain + uri.path).dirname().join(info["package"], info["revision"]);
    }
    Locator.getUri = function() {
        return uri;
    }
    Locator.getUrl = function() {
        return uri.url;
    }
    Locator.toString = function() {
        var name = Locator.getPackageName();
        return type.toUpperCase() + "(" + uri.url + ")"+((name)?"[" + name + "]":"")+"@" + info["revision"];
    }

    return Locator;
}
