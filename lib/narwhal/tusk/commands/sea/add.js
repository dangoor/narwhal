
var util = require('util');
var args = require('args');
var fs = require('file');
var sea = require('../../sea');


var parser = exports.parser = new args.Parser();

parser.help('Add an existing sea.');

parser.helpful();


parser.action(function (options) {

    var path;
    if (options.args.length && !/^-/.test(options.args[0]))
        path = options.args.shift();
    else
        path = fs.cwd();
    path = fs.path(path).absolute();

    var newSea = sea.Sea(path);

    if(!newSea.exists()) {
        print("error: directory does not exist: " + path);
        return;
    }

    if(!newSea.validate()) {
        print("error: directory does not appear to be a valid sea: " + path);       
        return;
    }

    newSea.register();

    print("Added sea at: " + path);

});

