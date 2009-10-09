
/**
 * @test tests/tusk/commands/sea/list.js
 */

var ARGS = require('args');
var parser = exports.parser = new ARGS.Parser();

parser.help('List all known seas');

parser.action(function (options, parentOptions, context) {
    
    var tusk = context.tusk,
        planet = tusk.getPlanet(),
        theme = tusk.getTheme();

    var seas = planet.getSeas(),
        sea,
        message,
        data,
        line;

    for(  var i=1 ; i<seas.length+1 ; i++ ) {
        sea = seas[i-1];

        data = (message = theme.newMessage({
            index: i,
            path: sea.getPath().valueOf(),
            exists: sea.exists()
        })).getData();

        line = "";
        if(data.exists) {

            message.augment({
                name: sea.getName() || "",
                valid: sea.validate()
            });
            
            line += "\0magenta([{index}]\0) \0green({name}\0): {path}";
            if(data.valid) {
                 line += " (\0green(valid\0))";
            } else {
                 line += " (\0red(invalid\0))";
            }

        } else {
            line += "{path} \0red((not found)\0)";
        }

        message.setTermString(line).finalize();
    }
});
