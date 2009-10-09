
var SYSTEM = require('system');
var FILE = require('file');
var UTIL = require('util');
var ARGS = require('args');
var STREAM = require('term').stream;

var parser = exports.parser = new ARGS.Parser();

parser.help('Show information about the currently active sea');


var action = function (options, parentOptions, context) {
    
    var tusk = context.tusk,
        sea = tusk.getSea(),
        theme = tusk.getTheme();
            
            
    var seaPath = sea.getPath(),
        narwhalConfig = seaPath.join("narwhal.conf"),
        message;



    message = theme.newMessage({
    }, "\0bold(\0yellow(Sea:\0)\0)", "note").finalize();
    
    message.startGroup();
    
    if(sea.getName()=="narwhal") {

        theme.newMessage({
            "message": "(default 'narwhal' sea is active)"
        }, "{message}").finalize();
        
    } else {
    
        UTIL.forEach(["SEA","SEALVL", "OLDSEA", "PACKAGE_HOME"], function(name) {
            theme.newMessage({
                "type": "sea",
                "name": name,
                "value": SYSTEM.env[name]
            }, "\0green({name}:\0) {value}").finalize();
        })
        
        if(narwhalConfig.exists()) {
            theme.newMessage({
                "type": "sea",
                "name": "narwhal.conf",
                "path": narwhalConfig.valueOf(),
                "found": true
            }, "\0green({name}:\0) {path}").finalize();
        } else {
            theme.newMessage({
                "type": "sea",
                "name": "narwhal.conf",
                "path": narwhalConfig.valueOf(),
                "found": false
            }, "\0green({name}:\0) not found ({path})").finalize();

        }
        
    }

    message.endGroup();
        

    message = theme.newMessage({
    }, "\0bold(\0yellow(Narwhal is using:\0)\0)", "note").finalize();
    
    message.startGroup();

    
    UTIL.forEach(["PATH","PACKAGE_HOME", "NARWHAL_HOME", "NARWHAL_ENGINE_HOME"], function(name) {

        var value = SYSTEM.env[name] || "";

        if(name=="PATH" && seaPath) {
            value = SYSTEM.env[name].replace(new RegExp(seaPath, "g"), "\0red("+seaPath+"\0)");
        }

        theme.newMessage({
            "type": "narwhal",
            "name": name,
            "value": value
        }, "\0green({name}:\0) {value}").finalize();
    })
    
    if(!narwhalConfig.exists()) {
        theme.newMessage({
            "type": "narwhal",
            "name": "narwhal.conf",
            "path": narwhalConfig.valueOf(),
            "found": false
        }, "\0green({name}:\0) not found ({path})").finalize();
    } else {
        var message1 = theme.newMessage({
            "type": "narwhal",
            "name": "narwhal.conf",
            "path": narwhalConfig.valueOf(),
            "found": true
        }, "\0green({name}:\0) {path}").finalize();
        
        message1.startGroup();
        
        UTIL.forEach(narwhalConfig.read({charset:'utf-8'}).split("\n"), function(line) {
            theme.newMessage({
                "line": line
            }, "{line}").finalize();
        });
        
        message1.endGroup();
    }
    
    message.endGroup();
}

parser.action(action);
