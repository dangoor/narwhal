
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var FILE = require("file");
var UTIL = require("util");
var STREAM = require('term').stream;


exports.Theme = function (name) {

    // PRIVATE

    var messages = [];
    var groups = [];


    // PUBLIC
    
    var Theme = {};
        
    Theme.print = function(msg) {
        STREAM.print(msg);
    }
    
    Theme.newMessage = function(data, termString, type) {
        var message = newMessage(Theme, data, termString, type);
        messages.push(message);
        return message;
    }

    Theme.getMessages = function() {
        return messages;
    }

    Theme.getType = function() {
        // TO BE SUBCLASSED
    }
    
    Theme.onMessageFinalize = function(message) {
        // TO BE SUBCLASSED
    }
        

    var impl;
    if(name=="default") {
        impl = exports.DefaultTheme(Theme);
    } else
    if(name=="json-stream") {
        impl = exports.JsonStreamTheme(Theme);
    } else {
        throw "unknown theme: " + name;
    }    
    UTIL.update(Theme, impl);
    return Theme;
    
    
    
    // PRIVATE
    
    function newMessage(owner, data, termString, type) {

        termString = termString || "";
        type = type || "message";
        
        var groupOffset = groups.length;

        var Message = {};
        
        Message.augment = function(newData) {
            UTIL.update(data, newData);
        }
        
        Message.getData = function() {
            var out = data;
            UTIL.keys(out).forEach(function(name) {
                out[name] = replaceVars(out[name], out);
            });
            return out;
        }
        
        Message.setTermString = function(str) {
            termString = replaceVars(str, Message.getData());
            return Message;
        }

        Message.setType = function(str) {
            type = str;
            return Message;
        }

        Message.startGroup = function() {
            groups.push(Message);
            return Message;
        }

        Message.endGroup = function() {
            groups.pop();
            return Message;
        }

        Message.getType = function() {
            return type;
        }

        Message.getTermString = function() {
            var str = "";
            for( var i=0 ; i<groupOffset ; i++ ) {
                str += "  ";
            }
            str += replaceVars(termString, Message.getData());
            return str;
        }
        
        Message.finalize = function() {
            owner.onMessageFinalize(Message);
            return Message;
        }
        
        return Message;
    }
    
    function replaceVars(subject, vars) {
        var m,
            out = subject;
        while((m = /[^\\]?{([^}]*)}/g.exec(subject)) != null) {
           out = out.replace(new RegExp("{" + m[1] + "}", "g"), vars[m[1]]);
        }
        return out;    
    }
}



exports.DefaultTheme = function (Theme) {
    var DefaultTheme = {};

    DefaultTheme.getType = function() {
        return "default";
    }

    DefaultTheme.onMessageFinalize = function(message) {
        if(message.getType()=="error") {
            Theme.print("\0red(" + message.getTermString() + "\0)");
        } else
        if(message.getType()=="info") {
            Theme.print("\0blue(" + message.getTermString() + "\0)");
        } else
        if(message.getType()=="note") {
            Theme.print(message.getTermString());
        } else {
            Theme.print(message.getTermString());
        }
    }
    
    return DefaultTheme;
}


exports.JsonStreamTheme = function (Theme) {
    var JsonStreamTheme = {};

    JsonStreamTheme.getType = function() {
        return "json-stream";
    }

    JsonStreamTheme.onMessageFinalize = function(message) {
        // do not print anything
    }
    
    return JsonStreamTheme;
}
