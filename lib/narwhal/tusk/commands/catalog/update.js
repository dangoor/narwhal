
var fs = require('file');
var util = require('util');
var args = require('args');
var json = require('json');
var stream = require('term').stream;
var CATALOG = require('../../catalog');

var parser = exports.parser = new args.Parser();

parser.help("Update a catalog from it's origin.");

var action = exports.action = function (options) {
    
    var name = options.args[0];
    
    if(name) {
        
        var catalog = CATALOG.getCatalog(name);
        catalog.update();
        
    } else {
        
        print("Updating all planet catalogs");

        var catalogs = CATALOG.list();
        
        catalogs.planet.forEach(function(path) {
            action({
                args: [CATALOG.Catalog(path).getName()]
            });
        });
    }
}

parser.action(action);
