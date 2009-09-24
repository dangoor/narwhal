
var fs = require("file");
var args = require("args");
var parser = exports.parser = new args.Parser();


parser.help('Config specific commands');


var commandsPath = fs.Path(module.id).dirname();

parser.command('show', commandsPath + '/show');

parser.helpful();


parser.action(function (options) {});
