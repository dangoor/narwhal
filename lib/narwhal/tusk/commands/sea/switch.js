
var OS = require('os');
var ARGS = require('args');

var parser = exports.parser = new ARGS.Parser();

parser.help('Switch to a sea');

var action = exports.action = function (options, parentOptions, context) {
    
    var tusk = context.tusk,
        planet = tusk.getPlanet(),
        theme = tusk.getTheme();
    
    var selector = options.args[0],
        sea = planet.getSeaForSelector(selector),
        path;

    if(!sea) {
        theme.newMessage({
            "selector": selector,
            "message": "No sea found"
        }, "{message} for: {selector}", "error").finalize();
        return;
    }
    
    if(!sea.validate()) {
        theme.newMessage({
            "path": sea.getPath().valueOf(),
            "message": "Cannot switch; sea not valid"
        }, "{message}: {path}", "error").finalize();
        return;
    }
    
    var bin = sea.getBinPath().join("sea");
    if(!bin.exists()) {
        theme.newMessage({
            "path": bin.valueOf(),
            "message": "Sea does not have an activation script"
        }, "{message} at: {path}", "error").finalize();
        return;        
    }
    
    theme.newMessage({
        "name": sea.getName(),
        "path": sea.getPath().valueOf(),
        "message": "Switching sea"
    }, "\0yellow(Switching to sea \0bold({name}\0) at path: \0bold({path}\0)\0)").finalize();

    OS.system(bin.valueOf());

};

parser.action(action);
