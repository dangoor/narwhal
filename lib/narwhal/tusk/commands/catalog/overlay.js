
var fs = require('file');
var util = require('util');
var args = require('args');
var json = require('json');
var stream = require('term').stream;
var CATALOG = require('../../catalog');

var parser = exports.parser = new args.Parser();

parser.option('--catalog', 'catalog')
    .set()
    .help('The optional planet catalog to add the overlay to. If omitted the overlay will be added to the sea catalog.');

parser.help("Add an overlay (another catalog) to a catalog.");

parser.helpful();

var action = exports.action = function (options) {
    
    var name = options.args[0];
    if(!name) {
        print("error: you must specify a catalog name to overlay");    
        return;
    }
    
    var overlay = CATALOG.getCatalog(name);
    if(!overlay.exists()) {
        print("error: catalog not found: " + name);
        return;
    }
    
    var catalog = CATALOG.getCatalog(options.catalog);
    if(!catalog.exists()) {
        print("error: catalog not found: " + options.catalog);
        return;
    }
    
    if(catalog.hasOverlay(overlay)) {
        print("error: catalog '"+catalog.getName()+"' already has overlay '"+overlay.getName()+"'");
        return;
    }

    catalog.addOverlay(overlay);
    
    print("Added overlay '"+overlay.getName()+"' to '"+catalog.getName()+"'");    
}

parser.action(action);
