
var FILE = require("file");
var ARGS = require("args");
var parser = exports.parser = new ARGS.Parser();

parser.help('Package specific commands');

parser.option('--package')
    .set()
    .help('The package to work with. By default this is the sea package.');

var commandsPath = FILE.Path(module.id).dirname();

parser.command('add', commandsPath + '/add');
//parser.command('link', commandsPath + '/link');
//parser.command('remove', commandsPath + '/remove');
parser.command('list', commandsPath + '/list');
parser.command('create', commandsPath + '/create');
parser.command('install', commandsPath + '/install');
//parser.command('uninstall', commandsPath + '/uninstall');
parser.command('build', commandsPath + '/build');

parser.helpful();


parser.action(function (options) {});
