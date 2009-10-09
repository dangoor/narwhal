
var FILE = require("file");
var ARGS = require("args");
var parser = exports.parser = new ARGS.Parser();

parser.help('Sea specific commands');

var commandsPath = FILE.Path(module.id).dirname();

parser.command('show', commandsPath + '/show');
parser.command('create', commandsPath + '/create');
parser.command('init', commandsPath + '/init');
parser.command('list', commandsPath + '/list');
//parser.command('add', commandsPath + '/add');
//parser.command('bundle', commandsPath + '/bundle');
parser.command('switch', commandsPath + '/switch');
parser.command('validate', commandsPath + '/validate');

parser.helpful();


parser.action(function (options) {});