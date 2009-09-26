
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var fs = require('file');
var util = require('util');
var args = require('args');
var json = require('json');
var stream = require('term').stream;
var CATALOG = require('../../catalog');

var parser = exports.parser = new args.Parser();

parser.option('--catalog', 'catalog')
    .set()
    .help('The optional planet catalog.');

parser.help("List all packages in a catalog.");


var action = exports.action = function (options) {

    var catalog = CATALOG.getCatalog(options.catalog);
    if(!catalog.exists()) {
        print("error: catalog not found: " + options.catalog);
        return;
    }

    print("Packages in "+((catalog.getType()=="sea")?"sea":"planet")+" catalog '" + catalog.getName() + "':");

    var installMethod,
        url;
    catalog.forEachPackage(function(name, info, overlayName) {
        
        if(!util.has(info, "origin")) {
            installMethod = "COPY";
            url = info.location;
        } else
        if(info.origin.installMethod=="link") {
            installMethod = "\0cyan("+info.origin.installMethod.toUpperCase()+"\0)";
            url = info.origin.url;
        } else {
            installMethod = info.origin.installMethod.toUpperCase();
            url = info.origin.url;
        }
        
        stream.print("  " + name + " \0magenta(<- "+((overlayName)?"\0yellow(("+overlayName+")\0) ":"")+url+"\0) " + installMethod);
    });
}

parser.action(action);
