
var FILE = require("file");
var ARGS = require("args");
var parser = exports.parser = new ARGS.Parser();

parser.help('Config specific commands');

var commandsPath = FILE.Path(module.id).dirname();


parser.command('show', commandsPath + '/show');


parser.helpful();

parser.action(function (options) {});
