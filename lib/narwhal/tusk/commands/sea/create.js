
var util = require('util');
var args = require('args');
var fs = require('file');
var sea = require('../../sea');

var SWITCH = require("./switch");

var parser = exports.parser = new args.Parser();

parser.help('Create a new sea.');

parser.option('-s', '--switch', 'switch')
    .bool()
    .help('Switch to the sea after creating it.');

parser.option('--name', 'name')
    .set()
    .help('The name of the sea.');

parser.helpful();


parser.action(function (options) {

    var path;
    if (options.args.length && !/^-/.test(options.args[0]))
        path = options.args.shift();
    else
        path = fs.cwd();
    path = fs.path(path).absolute();

    var newSea = sea.Sea(path);

    if(newSea.exists()) {
        print('error: directory not empty: ' + path);
        return;
    }
    
    newSea.create({
        name: options.name
    });
    
    print("Created sea with name '" + newSea.getName() + "' at: " + path);
    
    if(options["switch"]) {
        SWITCH.action({
            args: [newSea.path.valueOf()]
        });
    }
});

