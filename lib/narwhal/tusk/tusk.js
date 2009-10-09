
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };



var fs = require("file");
var packages = require("packages");
var util = require("util");
var json = require("json");
var http = require("http");
var config = require("./config");
var catalog = require("./catalog");

var SYSTEM = require("system");
var UTIL = require("util");
var FILE = require("file");
var PLANET = require("./planet");
var SEA = require("./sea");
var THEME = require("./theme");
var CATALOG = require("./catalog");
var LOADER = require("loader");
var SANDBOX = require("sandbox");

var minCatalogVersion = 1;


var activeStack = [];

exports.Tusk = function (planet, sea, theme) {

    // PRIVATE

    planet = planet || FILE.Path(SYSTEM.env["HOME"]).join(".tusk").valueOf();
    sea = sea || SYSTEM.env["SEA"] || FILE.path(SYSTEM.prefixes[0]).valueOf();
    theme = theme || "default";
    
    if(typeof planet == "string") {
        planet = PLANET.Planet(planet);
    }
    if(typeof sea == "string") {
        sea = planet.getSeaForSelector(sea);
    }
    if(typeof theme == "string") {
        theme = THEME.Theme(theme);
    }
    
    // this works in all cases except for when a sea is using a different narwhal
    var narwhalHomePath = FILE.Path(SYSTEM.env["NARWHAL_HOME"]);
    sea.setNarwhalCatalog(CATALOG.Catalog(narwhalHomePath.join("catalog.json")));

    var helpers = {};
    
    // PUBLIC

    var Tusk = {};
    
    Tusk.getTheme = function() {
        return theme;
    }
    
    Tusk.getPlanet = function() {
        return planet;
    }
    
    Tusk.getSea = function() {
        return sea;
    }
    
    Tusk.getNarwhalHomePath = function() {
        return narwhalHomePath;
    }
    
    Tusk.activate = function() {
        activeStack.push(Tusk);
    }

    Tusk.deactivate = function() {
        activeStack.pop();
    }
    
    Tusk.getHelper = function(name, defaultValue) {
        if(!UTIL.has(helpers, name)) {
            helpers[name] = defaultValue;
        }
        return helpers[name];
    }
    
    Tusk.command = function(args) {
        
        if(!UTIL.isArrayLike(args)) {
            args = args.split(" ");
        }
            
        var Loader = LOADER.Loader;
        var Sandbox = SANDBOX.Sandbox;

        var system = UTIL.copy(require("system"));
        
        var paths = [];
        // add all system related paths
        // TODO: Can this be done in a better way?
        require.paths.forEach(function(path) {
            if(path.substr(0,system.prefix.length+1)==system.prefix+"/") {
                paths.push(path);
            }
        });

        var loader = Loader({"paths": paths});
        var sandbox = Sandbox({
            "loader": loader,
            "system": system,
            "modules": {
                "system": system
            }
        });
        
        system = sandbox.force("system");

/*
        var systemErrors = [];
        // TODO: can this be done without monkey patching?
        system.log.error = function(msg) {
            systemErrors.push(msg);
        }
*/

        sandbox("global");        
        sandbox('packages').load([
            system.prefix,
            sea.getPath()
        ]);

        
        var cli = sandbox("narwhal/tusk/tusk-cli");

        args.unshift("tusk");

        var usedTheme = cli.main(planet.getPath().valueOf(),
                                 sea.getPath().valueOf(),
                                 theme.getType(),
                                 args);
/*
        systemErrors.forEach(function(message) {
            usedTheme.newMessage({
                "message": message
            }, "{message}", "error").finalize();
        });
*/        
        return usedTheme;
    }
    
    return Tusk;
}


var TuskError = exports.TuskError = function(message) {
    this.name = "TuskError";
    this.message = message;

    // this lets us get a stack trace in Rhino
    if (typeof Packages !== "undefined")
        this.rhinoException = Packages.org.mozilla.javascript.JavaScriptException(this, null, 0);
}
TuskError.prototype = new Error();


exports.getActive = function() {
    return activeStack[activeStack.length-1];
}





// OLD

exports.getDirectory = function () {
    return fs.path(system.prefixes[0]);
};

exports.getPackagesDirectory = function () {
    return exports.getDirectory().join('packages');
};

exports.getTuskDirectory = function () {
    var tuskDirectory = exports.getDirectory().join('.tusk');
    tuskDirectory.mkdirs();
    return tuskDirectory;
}

exports.getBuildDirectory = function () {
    var buildDirectory = exports.getDirectory().join('build');
    buildDirectory.mkdirs();
    return buildDirectory;
}

exports.getZipsDirectory = function () {
    return exports.getDirectory().join('zips');
};

exports.getCatalogPath = function () {
    return exports.getTuskDirectory().join('catalog.json');
};

exports.readCatalog = function () {
    var catalogPath = exports.getCatalogPath();
    if (!catalogPath.exists())
        throw new Error(catalogPath + " does not exist.");
    if (!catalogPath.isFile())
        throw new Error(catalogPath + " is not a file.");
    var catalog = json.decode(catalogPath.read({charset: 'utf-8'}));
    if (catalog.version === undefined || +catalog.version < minCatalogVersion)
        throw new Error("catalog is out of date.  use tusk update or create-catalog");
    return catalog;
};

exports.writeCatalog = function (catalog) {
    var catalogPath = exports.getCatalogPath();
    print('Writing ' + catalogPath);
    return catalogPath.write(
        json.encode(catalog, null, 4),
        {charset: 'utf-8'}
    );
};

exports.update = function (options) {
    require('./commands/update').update.call(this, options);
};

exports.getSourcesPath = function () {
    var try1 = exports.getTuskDirectory().join('sources.json');
    var try2 = exports.getDirectory().join('sources.json');
    if (try1.isFile())
        return try1;
    if (try2.isFile())
        return try2;
};

exports.readSources = function () {
    var sources = json.decode(exports.getSourcesPath().read(
        {charset: 'utf-8'}
    ));
    if (
        sources.version === undefined ||
        +sources.version < minCatalogVersion
    )
        throw new Error(
            "sources file is out of date.  version " +
            minCatalogVersion + " is required."
        );
    sources.packages = sources.packages || {};
    return sources;
};

exports.writeSources = function (sources) {
    return exports.getSourcesPath().write(
        json.encode(sources, null, 4),
        {charset: 'utf-8'}
    );
};

exports.getNotesPath = function () {
    return exports.getTuskDirectory().join('notes.json');
};

exports.readNotes = function () {
    var notesPath = exports.getNotesPath();
    if (!notesPath.isFile())
        return {};
    return json.decode(notesPath.read(
        {charset: 'utf-8'}
    ));
};

exports.writeNotes = function (notes) {
    return exports.getNotesPath().write(
        json.encode(notes, null, 4),
        {charset: 'utf-8'}
    );
};




// TODO: move to planet.js
exports.getPlanetTuskDirectory = function() {
    return fs.Path(system.env["HOME"]).join(".tusk");
}

// DEPRECATED
exports.getCacheDirectory = function() {
    var path = exports.getPlanetTuskDirectory().join("cache");
    path.mkdirs();
    return path;
}

// DEPRECATED
exports.getPlanetConfig = function() {
  var homeConfig = exports.getPlanetTuskDirectory().join("tusk.json");
  return config.TuskConfig(homeConfig);
}

// DEPRECATED
exports.getSeaConfig = function() {
  var seaConfig = exports.getTuskDirectory().join("tusk.json");
  return config.TuskConfig(seaConfig);
}

