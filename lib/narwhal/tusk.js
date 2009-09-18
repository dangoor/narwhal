
var system = require("system");

var args = require("args");
var parser = exports.parser = new args.Parser();

var commandsPath = module.id + "/commands";


parser.help('A Narwhal project package manager.');

// parser.option('sources', exports.sources);


parser.command('bin', null)
    .help('lists all packaged executables');

parser.command('list', commandsPath + '/list')

parser.command('install', commandsPath + '/install');

parser.command('upgrade', null)
    .help('downloads the latest version of a package');

parser.command('remove', null)
    .help('removes the local copy of package');

parser.command('update',commandsPath + '/update');

parser.command('search', null)
    .help('searches the package catalog');

parser.command('init', commandsPath + '/init');

parser.command('engine', commandsPath + '/engine');

parser.command('freeze', null)
    .help('writes a freeze.json file');

parser.command('bundle', null)
    .help('creates an archive of your project and its package dependencies');

parser.command('reheat', commandsPath + '/reheat');

parser.command('clone', commandsPath + '/clone');

parser.command('catalog', commandsPath + '/catalog');

parser.command('create-catalog', commandsPath + '/create-catalog');

parser.command('package', commandsPath + '/package');

parser.command('orphans', null)
    .help('lists packages that are no longer wanted by the user or other packages.')

parser.command('consolidate', commandsPath + '/consolidate');

parser.helpful();


// run it

exports.main = function (args) {
    var options = parser.parse(args);
    if (!options.acted)
        parser.printHelp(options);
};

if (module.id == require.main)
    exports.main(system.args);

