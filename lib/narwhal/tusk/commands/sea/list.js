
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
        line,
        path,
        sea;
    
    for(  var i=1 ; i<list.length+1 ; i++ ) {
        path = list[i-1];
        sea = SEA.Sea(path);

        if(sea.exists()) {
            
            line = "\0magenta([" + i + "]\0) \0green(" + (sea.getName() || "")  + "\0): " + path;

            if(sea.validate()) {
                 line += " (\0green(valid\0))";
            } else {
                 line += " (\0red(invalid\0))";
            }
            
        } else {
            line = path + " \0red((not found)\0)";
        }

        stream.print(line);
    }

});

