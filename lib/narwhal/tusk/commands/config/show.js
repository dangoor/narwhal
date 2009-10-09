
var JSDUMP = require('test/jsdump').jsDump;
var ARGS = require('args');

var parser = exports.parser = new ARGS.Parser();

parser.help('Show tusk config information');


parser.action(function (options, parentOptions, context) {

    var tusk = context.tusk,
        planet = tusk.getPlanet(),
        theme = tusk.getTheme();


    var config = planet.getConfig();
    
    
    var message = theme.newMessage({
        "path": config.getPath().valueOf(),
        "note": "Tusk config"
    }, "\0bold({note} at: {path}\0)", "note").finalize();
    
    message.startGroup();

    theme.newMessage({
        "config": JSDUMP.parse(config.config),
    }, "{config}").finalize();
    
    message.endGroup();

});


