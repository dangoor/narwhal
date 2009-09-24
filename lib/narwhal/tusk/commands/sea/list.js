
var fs = require('file');
var util = require('util');
var args = require('args');
var json = require('json');
var stream = require('term').stream;
var SEA = require('../../sea');

var parser = exports.parser = new args.Parser();

parser.help('List all known seas.');

parser.action(function (options) {
    
    var list = SEA.list(),
        path,
        sea;
    
    for(  var i=1 ; i<list.length ; i++ ) {
        path = list[i-1];
        
        var line = path;
        
        var manifestPath = fs.Path(path).join("package.json");
        if(manifestPath.exists()) {
            var manifest = json.decode(manifestPath.read({charset:"utf-8"}));
            line += " \0green((" + (manifest.name || "")  + ")\0) \0magenta([" + i + "]\0)";
            
            sea = SEA.Sea(path);
            if(sea.validate()) {
                 line += " (\0green(valid\0))";
            } else {
                 line += " (\0red(invalid\0))";
            }
        }
        stream.print(line);
    }

});

