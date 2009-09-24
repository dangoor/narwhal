
var fs = require('file');
var util = require('util');
var args = require('args');
var stream = require('term').stream;

var parser = exports.parser = new args.Parser();

parser.help('Show information about the currently active sea.');

var action = exports.action = function (options) {
            
    stream.print("\0bold(\0yellow(Sea:\0)\0)");
    
    var seaPath = null;
    var narwhalConfig = null;
    
    if(seaPath = system.env["SEA"]) {
        
        seaPath = fs.Path(seaPath);

        util.forEach(["SEA","SEALVL", "OLDSEA", "PACKAGE_HOME"], function(name) {
            stream.print("  \0green("+name+":\0) " + system.env[name]);
        })
        
        narwhalConfig = seaPath.join("narwhal.conf");
        if(narwhalConfig.exists()) {
            stream.print("  \0green(narwhal.conf:\0) " + narwhalConfig);
        } else {
            stream.print("  \0green(narwhal.conf:\0) " + "not found ("+narwhalConfig+")");
        }
        
    } else {
        print("  (no sea active)");
    }

    stream.print("\0bold(\0yellow(Narwhal is using:\0)\0)");
    
    util.forEach(["PATH","PACKAGE_HOME", "NARWHAL_HOME", "NARWHAL_ENGINE_HOME"], function(name) {

        var value = system.env[name] || "";

        if(name=="PATH" && seaPath) {
            value = system.env[name].replace(new RegExp(seaPath.join("bin")), "\0red("+seaPath.join("bin")+"\0)");
        }

        stream.print("  \0green("+name+":\0) " + value);
    })
    
    if(!narwhalConfig || !narwhalConfig.exists()) {
        stream.print("  \0green(narwhal.conf:\0)");
    } else {
        stream.print("  \0green(narwhal.conf:\0) " + narwhalConfig);
        
        util.forEach(narwhalConfig.read({charset:'utf-8'}).split("\n"), function(line) {
            stream.print("    " + line);
        });
    }
}

parser.action(action);
