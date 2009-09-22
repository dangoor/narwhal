
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

parser.command('orphans', null)
    .help('lists packages that are no longer wanted by the user or other packages.')

parser.command('consolidate', commandsPath + '/consolidate');



// TODO: Move 'tusk *-package' commands to 'tusk package *'?

parser.command('add-package', commandsPath + '/package/add');
parser.command('link-package', commandsPath + '/package/link');
parser.command('remove-package', commandsPath + '/package/remove');
parser.command('list-package', commandsPath + '/package/list');


// TODO: Move 'tusk *-sea' commands to 'tusk sea *'?

parser.command('show-sea', commandsPath + '/sea/show');
parser.command('create-sea', commandsPath + '/sea/create');
parser.command('init-sea', commandsPath + '/sea/init');
parser.command('list-sea', commandsPath + '/sea/list');
parser.command('add-sea', commandsPath + '/sea/add');
parser.command('bundle-sea', commandsPath + '/sea/bundle');


// TODO: Move 'tusk *-config' commands to 'tusk config *'?

parser.command('show-config', commandsPath + '/config/show');


// TODO: Move 'tusk *-catalog' commands to 'tusk catalog *'?

parser.command('add-catalog', commandsPath + '/catalog/add');
parser.command('list-catalog', commandsPath + '/catalog/list');


parser.helpful();


// run it

exports.main = function (args) {
    var options = parser.parse(args);
    if (!options.acted)
        parser.printHelp(options);
};

if (module.id == require.main)
    exports.main(system.args);

