
var system = require("system");
var fs = require("file");
var json = require("json");
var util = require("util");
var sea = require("./../sea");
var args = require("args");
var parser = exports.parser = new args.Parser();

parser.help('initializes a Narwhal package/project directory');

parser.option('--name', 'name').def("").set();
parser.option('--author', 'author').def("").set();
parser.option('--dependency', 'dependencies').push();
parser.option('--contributor', 'contributors').push();


parser.action(function (options, parentOptions) {
    parentOptions.acted = true;

    var path;
    if (options.args.length && !/^-/.test(options.args[0]))
        path = options.args.shift();
    else
        path = fs.cwd();
    path = fs.path(path).absolute();

    var seaOptions = options;
    delete seaOptions.args;
    delete seaOptions.command;
    
    sea.Sea(path).create(seaOptions);
    
    print(path);
});
