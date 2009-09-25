
var fs = require('file');
var util = require('util');
var args = require('args');
var json = require('json');
var stream = require('term').stream;
var CATALOG = require('../../catalog');

var parser = exports.parser = new args.Parser();

parser.help('List all known catalogs.');


parser.action(function (options) {
    
    var catalogs = CATALOG.list();
    var c;
    
    stream.print("\0bold(\0yellow(Sea:\0)\0)");

    if(seaPath = system.env["SEA"]) {
    
        catalogs.sea.forEach(function(path) {
            var catalog = CATALOG.Catalog(path);
            stream.print("  \0green(" + catalog.getName() + "\0): " + catalog.getPath() + " \0green((" + (c=catalog.getPackageCount()) + " package"+((c==1)?"":"s")+")\0)");
        });
        
    } else {
        stream.print("  (no sea active)");
    }

    stream.print("\0bold(\0yellow(Planet:\0)\0)");

    if(catalogs.planet.length>0) {

        catalogs.planet.forEach(function(path) {
            var catalog = CATALOG.Catalog(path);
            stream.print("  \0green(" + catalog.getName() + "\0): " + catalog.getPath() + 
                         " \0green((" + (c=catalog.getPackageCount()) + " package"+((c==1)?"":"s")+")\0)" +
                         " \0magenta(<- " + catalog.getOrigin().url + "\0)");
        });
    }
   
    stream.print("\0bold(\0yellow(Narwhal:\0)\0)");
    
    catalogs.narwhal.forEach(function(path) {
        var catalog = CATALOG.Catalog(path);
        stream.print("  \0green(" + catalog.getName() + "\0): " + catalog.getPath() + " \0green((" + (c=catalog.getPackageCount()) + " package"+((c==1)?"":"s")+")\0)");
    });
});
