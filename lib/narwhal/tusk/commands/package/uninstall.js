
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var util = require('util');
var fs = require('file');
var CATALOG = require('../../catalog');
var PACKAGE = require('../../package');
var SEA = require('../../sea');
var args = require('args');

var parser = exports.parser = new args.Parser();

parser.help('Uninstalls a package from the sea.');

parser.helpful();


parser.action(function (options) {
    
    var name = options.args[0];
    
    if(!name) {
        print("error: you must specify a package name");
        return;
    }
    
    var sea = SEA.getActive(),
        path = sea.getPackagesPath().join(name);
        
    if(!path.exists()) {
        print("error: package does not exist in sea at path: " + path);
        return;
    }
    
    var pkg = PACKAGE.Package(path);
    pkg.uninstall(sea);

});
