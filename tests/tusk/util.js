
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var OS = require("os");
var FILE = require("file");
var UTIL = require("util");
var STREAM = require("term").stream;
var ASSERT = require("test/assert");
var PLANET = require("narwhal/tusk/planet");
var SEA = require("narwhal/tusk/sea");
var THEME = require("narwhal/tusk/theme");
var TUSK = require("narwhal/tusk/tusk");
var JSDUMP = require('test/jsdump').jsDump;

var teach = (system.args.indexOf("--teach")>=0)?true:false;
var buildPath = SEA.getActive().getBuildPath().join("test", "tusk");



exports.getBuildPath = function() {
    return buildPath;
}

exports.setup = function() {
    
    var planetPath = exports.getBuildPath().join("planets", "defaultPlanet");
    if(planetPath.exists()) {
        planetPath.rmtree();
    }
    var seaPath = exports.getBuildPath().join("seas", "defaultSea");
    if(seaPath.exists()) {
        seaPath.rmtree();
    }
    
    var planet = PLANET.Planet(planetPath);
    planet.init();
    
    var sea = planet.newSea(seaPath);
    sea.init({
        name: "defaultSea"
    });

    return TUSK.Tusk(planet, sea, THEME.Theme("json-stream"));
}

exports.teardown = function(tusk) {
    tusk.getPlanet().destroy(exports.getBuildPath());
    tusk.getSea().destroy(exports.getBuildPath());
}

exports.expectResult = function(tusk, vars, command, data, debug) {
    command = exports.replaceVars(command, vars);
    debug = debug || false;
    var result = tusk.command(command).getMessages();
    
    // collect all messages into groups by type
    var messages = {};
    result.forEach(function(message) {
        if(!messages[message.getType()]) {
            messages[message.getType()] = [];
        }
        messages[message.getType()].push(message.getData());
    });
    
    // organize all comparison data into groups by type and match criteria
    var organizedData = {};
    for( var i=0 ; i<data.length ; i++ ) {
        if(UTIL.isArrayLike(data[i])) {
            if(data[i].length==2) {
                if(!organizedData[data[i][0].type]) {
                    organizedData[data[i][0].type] = {messages: [], match: data[i][0].match};
                }
                organizedData[data[i][0].type].messages = exports.replaceVars(data[i][1], vars);
            } else {
                throw "unexpected length for data definition";                
            }
        } else {
            if(!organizedData["message"]) {
                organizedData["message"] = {messages: [], match: "all"};
            }
            organizedData["message"].messages.push(exports.replaceVars(data[i], vars));
        }
    }
    
    // match compariosn data against messages received
    UTIL.keys(organizedData).forEach(function(messageType) {
        try {
            switch(organizedData[messageType].match) {
                case "all":
                    ASSERT.eq(organizedData[messageType].messages.length, messages[messageType].length);
                    ASSERT.eq(organizedData[messageType].messages, messages[messageType]);
                    break;
                case "contains":
                    if(organizedData[messageType].messages.length > messages[messageType].length) {
                        ASSERT.fail("insufficient messages");
                    }
                    organizedData[messageType].messages.forEach(function(compareMessage) {
                        var found = false;
                        messages[messageType].forEach(function(message) {
                            if(found) {
                                return;
                            }
                            if(UTIL.eq(compareMessage, message)) {
                                found = true;
                            }
                        });
                        if(!found) {
                            ASSERT.eq(compareMessage, {});
                        }
                    });
                    break;
            }
        } catch(e) {
            STREAM.print("\0yellow(Expected (" + organizedData[messageType].match + "):\0)");
            organizedData[messageType].messages.forEach(function(message) {
                STREAM.print("\0yellow(" + JSDUMP.parse(message) + "\0)");
            });
            STREAM.print("\0yellow(Actual:\0)");
            if(messages[messageType]) {
                messages[messageType].forEach(function(message) {
                    STREAM.print("\0yellow(" + JSDUMP.parse(message) + "\0)");
                });
            } else {
                    STREAM.print("\0yellow(" + "{}" + "\0)");
            }
            throw e;
        }        
    });
    if(debug) {
        STREAM.print("\0yellow(" + JSDUMP.parse(messages) + "\0)");
    }
}

exports.replaceVars = function(subject, vars) {
    var out = UTIL.copy(subject);
    if(UTIL.isArrayLike(out)) {
        for( var i=0 ; i<out.length ; i++ ) {
            out[i] = exports.replaceVars(out[i], vars);
        }
    } else
    if(typeof subject == "string") {
        var m;
        while((m = /[^\\]?{([^}]*)}/g.exec(subject)) != null) {
           out = out.replace(new RegExp("{" + m[1] + "}", "g"), vars[m[1]]);
        }
    } else {
        UTIL.keys(out).forEach(function(name) {
            out[name] = exports.replaceVars(out[name], vars);
        });
    }
    return out;    
}

exports.expectFS = function(moduleID, testName, subjectPath) {
    if(!subjectPath.exists()) {
        throw "path does not exist: " + subjectPath;
    }
    var modulePath = FILE.path(moduleID),
        referencePath = modulePath.dirname().join("_files", modulePath.basename(), "expectFS-" + testName);

    if(teach) {
        // when we are teaching the system we are copying from the
        // subject path to the reference path
        if(referencePath.exists()) {
            referencePath.rmtree();
        }
        referencePath.dirname().mkdirs();
        FILE.copyTree(subjectPath, referencePath);

    } else
    if(!referencePath.exists()) {
        throw "path does not exist: " + referencePath;
    } else {
        var cmd = "diff -r --side-by-side --suppress-common-lines " + referencePath + " " + subjectPath;
        var process = OS.popen(cmd);
        var result = process.communicate();
        if(result.status!==0) {
            STREAM.print("\n\0red(" +result.stdout.read() + "\0)");
            throw new ASSERT.AssertionError("FS mismatch!");
        }
    }
}
