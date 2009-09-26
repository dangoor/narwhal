
var fs = require("file");
var args = require("args");
var parser = exports.parser = new args.Parser();


parser.help('Catalog specific commands');


var commandsPath = fs.Path(module.id).dirname();

parser.command('add', commandsPath + '/add');
parser.command('list', commandsPath + '/list');
parser.command('remove', commandsPath + '/remove');
parser.command('update', commandsPath + '/update');
parser.command('overlay', commandsPath + '/overlay');
parser.command('packages', commandsPath + '/packages');

parser.helpful();


parser.action(function (options) {});
