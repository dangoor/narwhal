var fs = require('file');
var util = require('util');
var os = require('os');
var stream = require('term').stream;
var SEA = require('../../sea');

var ARGS = require('args');

var parser = exports.parser = new ARGS.Parser();

parser.help('Ensure a sea is valid (conforms to all sea requirements)');

parser.helpful();


var action = function (options, parentOptions, context) {
    
    var tusk = context.tusk,
        planet = tusk.getPlanet(),
        theme = tusk.getTheme();
    
    var sea = tusk.getSea();

    var message = theme.newMessage({
        "name": sea.getName(),
        "path": sea.getPath().valueOf(),
        "note": "Validation feedback for sea"
    }, "{note} '\0yellow({name}\0)' at path: {path}", "note").finalize();
    
    message.startGroup();
    
    var oo = sea.validate();

    message.endGroup();
    
    if(oo) {
        theme.newMessage({
            "valid": true,
            "message": "Sea is valid"
        }, "\0green({message}\0)").finalize();
    } else {
        theme.newMessage({
            "valid": false,
            "message": "Sea is not valid"
        }, "{message}; see above for feedback", "error").finalize();
    }
};

parser.action(action);
