
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var system = require("system");
var fs = require("file");
var json = require("json");
var util = require("util");
var tusk = require("./tusk");
var PACKAGE = require("./package");
var CATALOG = require("./catalog");
var MANIFEST = require("./manifest");
var stream = require('term').stream;


var Sea = exports.Sea = function (path) {
    if (!(this instanceof exports.Sea))
        return new exports.Sea(path);

    if(!(path instanceof fs.Path)) {
        path = fs.Path(path);
    }

    this.path = path;
}

Sea.prototype.exists = function() {
    return (this.path.exists() && this.path.glob('*').length>0);
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

Sea.prototype.validate = function(verbose) {

    if(!this.exists())
        return false;

    if(!(this.path.join("narwhal.conf").exists() || this.path.join("narwhal.conf.template").exists())) {
        if(verbose) {
            print("  narwhal.conf does not exist");   //narwhal.conf.template is only used to identify narwhal since it does not have a narwhal.conf
        }
        return false;        
    }
    
    if(!this.path.join("bin").exists()) {
        if(verbose) {
            print("  bin/ does not exist");
        }
        return false;
    }
    
    if(!this.path.join("catalog.json").exists()) {
        if(verbose) {
            print("  catalog.json does not exist");
        }
        return false;
    }
    
    if(this.getCatalog().getType()!="sea") {
        if(verbose) {
            print("  catalog.json does not specify type = sea");
        }
        return false;
    }
    
    return true;
}

Sea.prototype.getName = function() {
    return PACKAGE.Package(this.path).getName();
}

Sea.prototype.create = function(options) {

    if(this.exists() && !options.force) {
        throw "Sea already exists at: " + this.path;
    }

    this.init(options);
}

Sea.prototype.init = function(options) {

    delete options.force;


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
            name: "localhost." + packageInfo.name,
            type: "sea"
        }, null, 4));
    }
        
    path.join('bin').mkdirs();

    var sea = path.join('bin', 'sea');
    if(!sea.exists()) {
        fs.path(system.prefix).join('bin', 'sea').copy(sea);
        sea.chmod(0755);

        var contents = sea.read(),
            parts;
            
        // named and colored prompt
        if(parts = contents.match(/\n#(\s*export\sPS1=".*)%%sea.name%%(.*"\s*\n)/)) {
            contents = contents.replace(/\n#\s*export\sPS1=".*%%sea.name%%.*"\s*\n/, "\n" + parts[1] + packageInfo.name + parts[2]);
        }
        // change directory into sea
        if(parts = contents.match(/\n#(\s*cd\s\$PACKAGE_HOME\s*\n)/)) {
            contents = contents.replace(/\n#(\s*cd\s\$PACKAGE_HOME\s*\n)/, "\n" + parts[1]);
        }

        sea.write(contents);
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




Sea.prototype.getPackagesPath = function(name) {
    return PACKAGE.Package(this.path).getPackagesPath(name);
}

Sea.prototype.getPackageManifest = function() {
    return MANIFEST.Manifest(this.path.join("package.json"));
}

Sea.prototype.getBinPath = function() {
    return this.getPackageManifest().getBinPath();
}


Sea.prototype.isDependentOnPackage = function(name) {
    return this.getPackageManifest().isDependency(name);
}
Sea.prototype.getDependentPackageNames = function() {
    return this.getPackageManifest().getDependencyNames();
}

Sea.prototype.getCatalog = function() {
    var path = this.path.join("catalog.json"),
        catalog = CATALOG.Catalog(path);
    if(catalog.getType()!="sea") {
        // TODO: If verbose
//        stream.print("\0orange(warning: sea catalog does not specify type = sea in: "+path+"\0)");
    }
    return catalog;
}


exports.getActive = function() {
    var path = system.env["SEA"];
    if(!path) {
        path = tusk.getDirectory();
    }
    var sea = exports.Sea(path);
    if(!sea.validate()) {
        stream.print("\0orange(warning: sea is not valid: "+sea.path+"\0)");
    }
    return sea;
}

exports.formatNameFromPath = function(path) {
    return String(path.absolute()).replace(/\//g, ".").substr(1);
}

exports.list = function() {
    var tuskConfig = tusk.getPlanetConfig();
    
    if(!tuskConfig.exists() || !util.has(tuskConfig.config, "seas"))
        return [];
    
    return tuskConfig.config.seas;
}

exports.getByName = function(name) {
    var list = exports.list(),
        sea;
    for(  var i=1 ; i<list.length ; i++ ) {
        sea = exports.Sea(list[i-1]);
        if(sea.getName()==name) {
            return sea;
        }
    }
    return null;
}

exports.getBySelector = function(selector) {
    var sea;
    // check if we have a numeric sea number
    if( selector+1 > 1 ) {
        var list = exports.list();
        if(selector >= list.length+1) {
            return null;
        }
        sea = exports.Sea(list[selector-1]);
    } else
    // check if we have a sea path
    if((path = fs.Path(selector)) && path.exists() &&
       (sea = exports.Sea(path)) && sea.validate()) {
    } else {
        sea = exports.getByName(selector);
    }
    return sea;
}
