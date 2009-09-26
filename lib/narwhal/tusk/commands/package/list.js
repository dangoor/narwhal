
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var tusk = require("../../tusk");
var fs = require("file");
var util = require("util");
var args = require("args");
var packages = require("packages");

var PACKAGE = require("../../package");
var CATALOG = require("../../catalog");
var SEA = require("../../sea");

var parser = exports.parser = new args.Parser();

parser.help('List all installed packages');

parser.helpful();


parser.action(function (options) {
    var self = this;
    
    var pkg,
        directory,
        line,
        narwhalCatalog = CATALOG.getCatalog("narwhal"),
        narwhalCatalogPath = narwhalCatalog.getPath(),
        sea = SEA.getActive(),
        seaCatalog = sea.getCatalog(),
        isDependent,
        dependentPackageNames = sea.getDependentPackageNames();
    
        
    Object.keys(packages.catalog).forEach(function (name) {

        util.remove(dependentPackageNames, name);

        directory = packages.catalog[name].directory;
        
        line = "\0green(" + name + "\0) " + directory;
        
        // check if the package is listed as a dependency in the sea package.json
        if(isDependent = sea.isDependentOnPackage(name)) {
            line += "\0bold(";
        }
        line += " \0magenta((";
        
        if(seaCatalog.hasPackage(name)) {

            line += seaCatalog.getName();
            
        } else {
            
            // for backwards compatibility
            if(narwhalCatalog.hasPackage(name) ||
               directory.valueOf().substr(0,narwhalCatalogPath.dirname().valueOf().length+1)==narwhalCatalogPath.dirname().valueOf()+"/") {
    
                line += "narwhal";
            } else {
                line += "?";
            }
        }
        
        line += ")\0)";
        if(isDependent) {
            line += "\0)";
        }

        self.print(line);
    });
    
    dependentPackageNames.forEach(function(name) {

        pkg = null;

        line = "\0green(" + name + "\0) ";
        
        if(seaCatalog.hasPackage(name)) {
            pkg = seaCatalog.getPackage(name);
            line += pkg.getPath();
        } else {
            line += "?";
        }
        
        line += " \0bold(";
        line += "\0magenta((";

        if(pkg) {
            line += seaCatalog.getName();
        } else {
            line += "?";        
        }

        line += ")\0)";
        line += "\0) ";
        
        if(!pkg) {
            line += " \0red(\0bold(TIP\0): run 'tusk add-package <uri>' to add package to catalog\0)";
        }
        
        self.print(line);
    });
    
});

