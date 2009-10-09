
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var tusk = require("../../tusk");
var util = require("util");
var args = require("args");
var fs = require("file");
var json = require("json");
var http = require("http");
var URI = require("uri");
var zip = require("zip");
var packages = require("packages");
var SEA = require("../../sea");
var PACKAGE = require("../../package");
var CATALOG = require("../../catalog");
var tuskUtil = require("../../util");

var ADD = require("./add");


var parser = exports.parser = new args.Parser();

parser.help('Downloads and installs a package and its dependencies into the sea');

parser.args('package');

parser.option('-f', '--force', 'force')
    .bool()
    .help('Replace package if it already exists');

parser.option('--add', 'add')
    .bool()
    .help('Add the package to the sea catalog if not already added.');

/*
parser.option('-f', '--force', 'force')
    .bool()
    .help('causes packages to be installed in the project packages directory regardless of whether they are installed elsewhere');

parser.option('-l', '--lean', 'lean')
    .bool()
    .help('causes only the essential components of the library to be installed.');

parser.option('-t', '--test', 'test')
    .bool()
    .help('run tests before installing');

parser.option('-d', '--doc', 'doc')
    .bool()
    .help('build documentation');
*/

parser.helpful();

parser.action(function (options, parentOptions, context) {
    exports.install.call(this, options, parentOptions, context);
});

exports.install = function (options, parentOptions, context) {

    var tusk = context.tusk,
        sea = tusk.getSea(),
        theme = tusk.getTheme();


    var uri;
    if(options.args.length && !/^-/.test(options.args[0])) {
        uri = options.args.shift();
    } else {
        // no package name or URL provided. if -f is set
        // we install all missing dependencies for the sea
        if(options.force) {

            var message = theme.newMessage({
                "note": "Checking all dependencies for sea"
            }, "{note}", "note").finalize();

            message.startGroup();
            sea.forEachDependency(function(dependency) {
                pkg = dependency.getPackage();
                if(!pkg.exists()) {
                    pkg.install(dependency.getLocator());
                } else {
                    pkg.installDependencies();
                }
            });
            message.endGroup();
            
        } else {
            theme.newMessage({
                "message": "No URI or package name provided"
            }, "{message}", "error").finalize();
            theme.newMessage({
                "tip": "Use 'tusk package install -f' to install dependencies for sea"
            }, "TIP: {tip}", "info").finalize();
        }
        return;
    }
    
    
    
    // TODO: Needs to be refactored from here down
    
    throw "not yet implemented";
    
    
    
    uri = URI.parse(tuskUtil.normalizeURI(uri, {allow: ["file", "http", "tusk"], relativeFilePathsOnly: true}));
    
    // check if only a package name is provided
    var sea = SEA.getActive(),
        catalog = sea.getCatalog(),
        name;
        
    if(!(!uri.domain && uri.path.split("/").length==1)) {
        // we have a full URI
        
        if(options.add) {
            name = ADD.action({
                args: [uri.url],
                force: false,
                catalog: ""
            });
        } else {
            print("error: you must specify --add if using a URL to install a package");
            return;
        }
        
    } else {
        name = uri.path;
    }
    
    if(name=="narwhal") {
        // installing the 'narwhal' package conflicts with the sea/bin shortcuts and should
        // not be required as the system running tusk already has narwhal installed
        print("error: you cannot install the 'narwhal' package. it is already present on your system.");
        return;
    }
    
    print("Installing: " + name);

    var pkg = catalog.getPackage(name);

    if(!pkg.exists()) {
        print("error: package '" + uri + "' not found in catalog: " + catalog.getPath());
        return;
    }
    
    if(!pkg.validate()) {
        print("error: package does not appear valid" + pkg.getPath());
        return;
    }
    
    // TODO: ensure all dependencies are met before installing package
    this.print("\0red(TODO: ensure all dependencies are met before installing package\0)");
    
    
    // If we have a tusk URL (from the sea catalog) we do not want to name the package and install it
    // as a dependency instead.
    if(pkg.uri.protocol="tusk") {
        name = null;
    }
    
    pkg.install(sea, {
        name: name,
        force: options.force
    });

    print('Done.');
};

