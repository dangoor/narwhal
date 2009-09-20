
var fs = require('file');
var util = require('util');
var args = require('args');
var json = require('json');
var stream = require('term').stream;
var sea = require('../../sea');

var parser = exports.parser = new args.Parser();

parser.help('List all known seas.');

parser.action(function (options) {
    
    util.forEach(sea.list(), function(path) {
        
        var line = path;
        
        var manifestPath = fs.Path(path).join("package.json");
        if(manifestPath.exists()) {
            var manifest = json.decode(manifestPath.read({charset:"utf-8"}));
            line += " \0green((" + (manifest.name || "")  + ")\0)";
        }
        stream.print(line);
    });

});

