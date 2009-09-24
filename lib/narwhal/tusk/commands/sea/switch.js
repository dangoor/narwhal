
var fs = require('file');
var util = require('util');
var os = require('os');
var args = require('args');
var stream = require('term').stream;
var SEA = require('../../sea');


var parser = exports.parser = new args.Parser();

parser.help('Switch to a sea.');

var action = exports.action = function (options) {
    
    var name = options.args[0],
        sea,
        path;
    
    
    sea = SEA.getBySelector(name);

    if(!sea) {
        print("error: no sea found for: " + name);
        return;
    }
    
    if(!sea.validate()) {
        print("error: sea is not valid: " + sea.path);
        return;
    }
    
    stream.print("\0yellow(Switching to sea \0bold(" + sea.getName() + "\0) at path \0bold(" + sea.path + "\0).\0)");

    var bin = sea.path.join("bin", "sea");
    if(!bin.exists()) {
        print("error: sea does not have an activation script at: " + bin);
        return;        
    }

    os.system(bin.toString());

};

parser.action(action);
