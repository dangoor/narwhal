
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var fs = require('file');
var util = require('util');
var args = require('args');
var json = require('json');
var stream = require('term').stream;
var CATALOG = require('../../catalog');
var tuskUtil = require("../../util");

var parser = exports.parser = new args.Parser();

parser.option('-f', '--force', 'force')
    .bool()
    .help('Replace package if it already exists in catalog');

parser.help('Add a catalog.');

parser.helpful();


parser.action(function (options) {
    
    var uri = options.args[0];
    if(!uri) {
        print("error: catalog uri not specified");
        return;
    }

    uri = tuskUtil.normalizeURI(uri, {allow: ["file", "http"]});
    var newCatalog = CATALOG.Catalog(uri);
    
    var name = newCatalog.getName();
    
    var catalog = CATALOG.getCatalog(name);
    if(catalog.exists() && !options.force) {
        print("error: a catalog already exists with name: " + name);
        return;
    }
    
    catalog.create(name);
    catalog.replaceWith(newCatalog);

    print("Added catalog: " + name);
});
