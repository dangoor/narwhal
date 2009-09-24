var fs = require('file');
var util = require('util');
var os = require('os');
var args = require('args');
var stream = require('term').stream;
var SEA = require('../../sea');


var parser = exports.parser = new args.Parser();

parser.option('--sea', 'sea')
    .set()
    .help('A sea selector (numeric, name or path)');

parser.help('Ensure a sea is valid (conforms to all sea requirements');

parser.helpful();


var action = exports.action = function (options) {
    
    var sea;
    
    if(options.sea) {
        sea = SEA.getBySelector(options.sea);

        if(!sea) {
            print("error: no sea found for: " + options.sea);
            return;
        }

    } else {
        sea = SEA.getActive();

        if(!sea) {
            print("error: no sea is active. use --sea");
            return;
        }
    }

    stream.print("Validation feedback for sea: \0yellow(" + sea.getName() + "\0)");
    
    var oo = sea.validate(true);
    
    if(oo) {
        stream.print("\0green(Sea is valid!\0)");
    } else {
        stream.print("\0red(Sea is not valid! See above for feedback.\0)");
    } 

};

parser.action(action);