
var FILE = require("file");
var ARGS = require("args");
var parser = exports.parser = new ARGS.Parser();


parser.help('Catalog specific commands');


var commandsPath = FILE.Path(module.id).dirname();

//parser.command('add', commandsPath + '/add');
//parser.command('list', commandsPath + '/list');
//parser.command('remove', commandsPath + '/remove');
//parser.command('update', commandsPath + '/update');
//parser.command('overlay', commandsPath + '/overlay');
//parser.command('packages', commandsPath + '/packages');

parser.helpful();


parser.action(function (options) {});
