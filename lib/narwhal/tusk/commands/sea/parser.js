
var fs = require("file");
var args = require("args");
var parser = exports.parser = new args.Parser();


parser.help('Sea specific commands');


var commandsPath = fs.Path(module.id).dirname();

parser.command('show', commandsPath + '/show');
parser.command('create', commandsPath + '/create');
parser.command('init', commandsPath + '/init');
parser.command('list', commandsPath + '/list');
parser.command('add', commandsPath + '/add');
parser.command('bundle', commandsPath + '/bundle');
parser.command('switch', commandsPath + '/switch');

parser.helpful();


parser.action(function (options) {});
