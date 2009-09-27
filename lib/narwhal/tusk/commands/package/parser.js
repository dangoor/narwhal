
var fs = require("file");
var args = require("args");
var parser = exports.parser = new args.Parser();


parser.help('Package specific commands');


var commandsPath = fs.Path(module.id).dirname();

parser.command('add', commandsPath + '/add');
parser.command('link', commandsPath + '/link');
parser.command('remove', commandsPath + '/remove');
parser.command('list', commandsPath + '/list');
parser.command('create', commandsPath + '/create');
parser.command('install', commandsPath + '/install');
parser.command('uninstall', commandsPath + '/uninstall');
parser.command('build', commandsPath + '/build');

parser.helpful();


parser.action(function (options) {});
