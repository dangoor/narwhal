
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var util = require('util');
var fs = require('file');
var CATALOG = require('../../catalog');
var args = require('args');

var parser = exports.parser = new args.Parser();

parser.option('--catalog', 'catalog')
    .set()
    .help('The optional planet catalog to remove the package from. If omitted package will be removed from the sea catalog.');

parser.help('Remove a package from a catalog.');

parser.helpful();


parser.action(function (options) {
    
    var name = options.args[0];
    
    var catalog = CATALOG.getCatalog(options.catalog);
    
    if(!catalog.hasPackage(name)) {
        print("error: package does not exist in catalog");
        return;
    }

    catalog.removePackage(name);

    print("Removed package '"+ name +"' from catalog: " + catalog.getPath());    
});
