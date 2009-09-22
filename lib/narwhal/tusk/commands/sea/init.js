
var util = require('util');
var args = require('args');
var fs = require('file');
var sea = require('../../sea');
var PACKAGE = require('../../package');


var parser = exports.parser = new args.Parser();

parser.help('Initialize a sea for an existing package.');

parser.option('-f', '--force', 'force')
    .bool()
    .help('Initialize the sea even if it already exists. This effectively updates the sea.');

parser.helpful();


parser.action(function (options) {

    var path;
    if (options.args.length && !/^-/.test(options.args[0]))
        path = options.args.shift();
    else
        path = fs.cwd();
    path = fs.path(path).absolute();

    
    var pkg = PACKAGE.Package(path);

    if(!pkg.exists()) {
        print("error: no package found at: " + path);
        return;
    }
    if(!pkg.validate()) {
        print("error: no valid package found at: " + path);
        return;
    }

    var newSea = sea.Sea(path);

    if(newSea.validate() && !options.force) {
        print("error: a valid sea already exists at: " + path);
        return;
    }

    newSea.init({
        name: pkg.getName()
    });
    
    print("Initialized sea with name '" + newSea.getName() + "' at: " + path);

});

