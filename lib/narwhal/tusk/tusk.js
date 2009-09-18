
var system = require("system");
var fs = require("file");
var packages = require("packages");
var util = require("util");
var json = require("json");
var http = require("http");

var minCatalogVersion = 1;


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
    require('./tusk/update').update.call(this, options);
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
