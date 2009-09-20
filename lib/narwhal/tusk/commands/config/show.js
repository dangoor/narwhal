
var util = require('util');
var jsdump = require('test/jsdump').jsDump;
var tusk = require('../../tusk');
var stream = require('term').stream;
var args = require('args');

var parser = exports.parser = new args.Parser();

parser.help('Show tusk config information.');

parser.action(function (options) {
    
    tusk.getConfigs().forEach(function(config) {
        
        stream.print("\0green("+config.path+":\0)");
        
        var dump = jsdump.parse(config.config);
        dump.split("\n").forEach(function(line) {
            stream.print("  " + line); 
        });
        
    });

});


