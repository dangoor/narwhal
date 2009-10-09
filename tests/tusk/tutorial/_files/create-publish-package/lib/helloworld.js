
var DOMPLATE = require("domplate", "domplate");

exports.render = function (message) {
    
    var rep;

    with (DOMPLATE.tags) {
        rep = DOMPLATE.domplate({
            tag: DIV({"style": "color: red;"},"$object|capitalize"),
            capitalize: function(str) {
                return str.toUpperCase();
            }
        });
    }    

    var html = rep.tag.render({
        object: message
    });
    
    return html;

};