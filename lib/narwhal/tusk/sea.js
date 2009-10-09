
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var system = require("system");
var fs = require("file");
var json = require("json");
var util = require("util");
var tusk = require("./tusk");
var PACKAGES = require("packages");
var PACKAGE = require("./package");
var CATALOG = require("./catalog");
var DEPENDENCY = require("./dependency");
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

Sea.prototype.getPath = function() {
    return this.path;
}

Sea.prototype.destroy = function(prefixPath) {
    var path = this.getPath();
    if(!prefixPath || !prefixPath.valueOf() || 
       path.valueOf().substr(0,prefixPath.valueOf().length)!=prefixPath.valueOf()) {
        throw "sanity check failed for prefixPath: " + prefixPath;
    }
    path.rmtree();
}

Sea.prototype.setPlanet = function(planet) {
    this.planet = planet;
}

Sea.prototype.setNarwhalCatalog = function(catalog) {
    this.narwhalCatalog = catalog;
}
Sea.prototype.getNarwhalCatalog = function() {
    return this.narwhalCatalog;
}


/**
 * Add the sea to the planet tusk config
 */
Sea.prototype.register = function() {
    
    if(!this.exists())
        throw "sea directory does not exist";
    
    if(!this.validate())
        throw "sea does not appear to be valid";
    
    this.planet.addSea(this);
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

    options = options || {};

    delete options.force;


    var packageInfo = {
        "dependencies": ["narwhal"]
    };
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
            name: packageInfo.name,
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
                  "/packages/dependencies/\n" +
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


Sea.prototype.forEachInstalledPackage = function(callback) {
    // Iterate all packages installed in the sea
    var pkg;
    util.keys(PACKAGES.catalog).forEach(function(name) {
        pkg = PACKAGE.Package(PACKAGES.catalog[name].directory);
        pkg.setSea(this);
        callback(pkg);
    });        
}

Sea.prototype.getSeaPackage = function() {
    return PACKAGE.Package(this.getPath());
}

Sea.prototype.forEachDependency = function(callback) {
    var self = this,
        pkg = this.getSeaPackage();
    var dependencies =  this.getPackageManifest().getDependencies();
    if(!dependencies) {
        return false;
    }
    dependencies.forEach(function(dependency) {
        callback(DEPENDENCY.Dependency(self, pkg, dependency));
    });
}

Sea.prototype.getDependenciesPath = function() {
    return this.getSeaPackage().getPackagesPath().join("dependencies");
}


Sea.prototype.hasPackage = function(name) {
    return this.getPackagePath(name).exists();
}

Sea.prototype.getPackage = function(name) {
    var path = this.getPackagePath(name);
    if(!path.exists()) {
        return null;
    }
    var pkg = PACKAGE.Package(path);
    pkg.setSea(this);
    return pkg;
}

Sea.prototype.getPackagePath = function(name) {
/*    
    if(pkg instanceof PACKAGE.Package) {
        if(pkg.uri.protocol=="tusk") {
            return this.path.join("packages", "dependencies", pkg.uri.domain, pkg.uri.file, pkg.getRevision());
        }
    }
*/
/*
    var parts = pkg.split("/");
    // check if we have a <catalog>/<name>/<revision> selector
    if(parts.length==3) {
        return this.path.join("packages", "dependencies", parts[0], parts[1], parts[2]);
    } else {
*/    
        return this.path.join("packages", name);
//    }
}


Sea.prototype.getBuildPath = function() {
    var path = this.getPackageManifest().getBuildPath();
    if(path.valueOf().substr(0,1)!="/") {
        throw "build path is not absolute: " + path;
    }
    if(path.dirname().dirname().join("package.json").exists()) {
        throw "build path does not fall within a package/sea: " + path;
    }
    return path;
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

Sea.prototype.isPackageInstalled = function(name) {
    var path = this.getPackagePath(name);
    return path.exists();
}



Sea.prototype.isDependentOnPackage = function(name) {
    return this.getPackageManifest().isDependency(name);
}


// TODO: deprecate in favor of this.getDependencies()
Sea.prototype.getDependentPackageNames = function() {
    return this.getPackageManifest().getDependencyNames();
}

Sea.prototype.getDependencies = function() {
    var dependencies =  this.getPackageManifest().getDependencies();
    if(!dependencies) {
        return false;
    }
    for( var i=0 ; i<dependencies.length ; i++ ) {
        dependencies[i] = DEPENDENCY.Dependency(dependencies[i]);
    }
    return dependencies;
}

Sea.prototype.getCatalog = function() {
    var path = this.path.join("catalog.json"),
        catalog = CATALOG.Catalog(path);
    if(catalog.getType()!="sea") {
        // TODO: If verbose
//        stream.print("\0orange(warning: sea catalog does not specify type = sea in: "+path+"\0)");
    }
    catalog.setSea(this);
    return catalog;
}


// DEPRECATED
Sea.prototype.installDependencies = function(options) {
    var self = this;
    var dependencies = this.getDependencies();
    if(!dependencies) {
        return;
    }
    var pkg;
    dependencies.forEach(function(dependency) {
        dependency.install(self, options);
    });
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


// DEPRECATED
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
