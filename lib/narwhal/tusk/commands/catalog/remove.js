
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var fs = require('file');
var util = require('util');
var args = require('args');
var json = require('json');
var stream = require('term').stream;
var CATALOG = require('../../catalog');
var tuskUtil = require("../../util");

var parser = exports.parser = new args.Parser();

/*
parser.option('-f', '--force', 'force')
    .bool()
    .help('Remove catalog even if it is used by other catalogs and packages.');
*/

parser.help('Remove a catalog from the planet.');

parser.helpful();


parser.action(function (options) {
    
    var name = options.args[0];
    if(!name) {
        print("error: catalog name not specified");
        return;
    } else
    if(name=="narwhal") {
        print("error: you cannot remove the 'narwhal' catalog");
        return;
    }

    var catalog = CATALOG.getCatalog(name);
    
    if(!catalog.exists()) {
        print("error: catalog does not exist: "+name);
        return;
    }
    
    catalog.remove();

    print("Removed catalog: " + name);
});
