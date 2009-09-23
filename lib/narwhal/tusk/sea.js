
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var system = require("system");
var fs = require("file");
var json = require("json");
var util = require("util");
var tusk = require("./tusk");
var PACKAGE = require("./package");



var Sea = exports.Sea = function (path) {
    if (!(this instanceof exports.Sea))
        return new exports.Sea(path);

    if(!(path instanceof fs.Path)) {
        path = fs.Path(path);
    }

    this.path = path;
}

Sea.prototype.exists = function() {
    return (this.path.exists() && this.path.glob('**').length>0);
}

/**
 * Add the sea to the planet tusk config
 */
Sea.prototype.register = function() {
    
    if(!this.exists())
        throw "sea directory does not exist";
    
    if(!this.validate())
        throw "sea does not appear to be valid";
    
    tusk.getPlanetConfig().addSea(this);  
}

Sea.prototype.validate = function() {

    if(!this.exists())
        return false;

    if(!this.path.join("narwhal.conf").exists() ||
       !this.path.join("bin").exists() ||
       !this.path.join("catalog.json").exists()) {
        
        return false;
    }
    
    return true;
}

Sea.prototype.getName = function() {
    return PACKAGE.Package(this.path).getName();
}


Sea.prototype.create = function(options) {

    if(this.exists()) {
        throw "Sea already exists at: " + this.path;
    }

    this.init(options);
}

Sea.prototype.init = function(options) {
        
    var packageInfo = {};
    if(options)
      util.update(packageInfo, options);
      
    packageInfo.name = options.name || exports.formatNameFromPath(this.path);

    var path = this.path;
    var tmp;

//    path.join('.tusk').mkdirs();
    
    path.mkdirs();
    
    tmp = path.join("catalog.json");
    if(!tmp.exists()) {
        tmp.write(json.encode({
            name: "localhost." + packageInfo.name
        }, null, 4));
    }
        
    path.join('bin').mkdirs();
    path.join('lib').mkdirs();

    var sea = path.join('bin', 'sea');
    if(!sea.exists()) {
        fs.path(system.prefix).join('bin', 'sea').copy(sea);
        sea.chmod(0755);
    }
    
    var activate = path.join('bin', 'activate.bash');
    if(!activate.exists()) {
        fs.path(system.prefix).join('bin', 'activate.bash')
            .copy(activate);
    }
            
    tmp = activate.resolve('activate');
    if(!tmp.exists()) {
        activate.relative().symlink(tmp);
    }
    
//    path.join('README').touch();
    tmp = path.join('narwhal.conf');
    if(!tmp.exists()) {
        tmp.write('NARWHAL_DEFAULT_ENGINE=' + system.engine);
    }

    tmp = path.join('.gitignore');
    if(!tmp.exists()) {
        tmp.write(".DS_Store\n" +
                  ".tmp_*\n" +
                  "/build/\n");
    }

    var packagePath = path.join('package.json');
    if (packagePath.isFile()) {
        util.complete(
            packageInfo, 
            json.decode(packagePath.read({charset:'utf-8'}))
        );
    }
    packagePath.write(
        json.encode(packageInfo, null, 4),
        {charset:'utf-8'}
    );
 
    this.register();
}

Sea.prototype.getPackagePath = function(name) {
    return PACKAGE.Package(this.path).getPackagePath(name);
}


exports.list = function() {
    var tuskConfig = tusk.getPlanetConfig();
    
    if(!tuskConfig.exists() || !util.has(tuskConfig.config, "seas"))
        return [];
    
    return tuskConfig.config.seas;
}

exports.getActive = function() {
    var path = system.env["SEA"];
    if(path) {
        var sea = exports.Sea(path);
        if(sea.validate()) {
            return sea;
        }
    }
    return null;
}

exports.formatNameFromPath = function(path) {
    return String(path.absolute()).replace(/\//g, ".").substr(1);
}
