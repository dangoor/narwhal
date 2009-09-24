
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
var tuskUtil = require("../../util");

var ADD = require("./add");


var parser = exports.parser = new args.Parser();

parser.help('downloads and installs a package and its dependencies');

parser.args('package');

parser.option('-f', '--force', 'force')
    .bool()
    .help('Replace package if it already exists');

parser.option('-add', 'add')
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

parser.action(function (options) {
    exports.install.call(this, options);
});

exports.install = function (options) {

    var uri;
    if(options.args.length && !/^-/.test(options.args[0])) {
        uri = options.args.shift();
    } else {
        print("you must provide a URI or package name");
        return;
    }
    uri = URI.parse(tuskUtil.normalizeURI(uri, {allow: ["file", "http", "tusk"], relativeFilePathsOnly: true}));
    
    // check if only a package name is provided
    var pkg,
        catalog = SEA.getActive().getCatalog(),
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
    
    print("Installing: " + name);

    pkg = catalog.getPackage(name);

    
    if(!pkg.exists()) {
        print("error: package not found: " + uri);
        return;
    }
    
    if(!pkg.validate()) {
        print("error: package does not appear valid" + pkg.getPath());
        return;
    }
    
    // TODO: ensure all dependencies are met before installing package
    this.print("\0red(TODO: ensure all dependencies are met before installing package\0)");
    
    pkg.install(SEA.getActive(), {
        force: options.force
    });

    print('Done.');
};

