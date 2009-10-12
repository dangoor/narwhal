
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };



var system = require("system");
var fs = require("file");
var json = require("json");
var http = require("http");
var zip = require("zip");
var util = require("util");
var UTIL = require("util");
var md5 = require("md5");
var struct = require("struct");
var URI = require("uri");
var CATALOG = require("./catalog");
var SEA = require("./sea");
var tusk = require("./tusk");
var tuskUtil = require("./util");
var manifest = require("./manifest");
var STREAM = require('term').stream;


var FILE = require("file");
var TUSK = require("./tusk");
var DEPENDENCY = require("./dependency");


var Package = exports.Package = function (uri) {
    if (!(this instanceof exports.Package))
        return new exports.Package(uri);

    if(uri instanceof fs.Path) {
        uri = "file://" + uri;
    }
    
    uri = tuskUtil.normalizeURI(uri, {allow: ["file", "http", "tusk"]});
    
    this.uri = URI.parse(uri);
    this.locked = false;
/*
    if(this.uri.protocol=="file" && !fs.Path(this.uri.path).isDirectory() &&
       !/.zip$/.test(this.uri.file)) {
        throw "only zipped packages with a 'zip' extension are supported";
    }
*/    
}

Package.prototype.getPath = function() {
    
    if(!this.path) {
        
        
        if(this.uri.protocol=="file") {
            this.path = fs.Path(this.uri.path);
        } else
        if(this.uri.protocol=="tusk") {

            throw new TUSK.TuskError("DPRECATED");

/*
            var catalog = CATALOG.getCatalog(this.uri.domain);
            if(!catalog.exists()) {
                throw "no planet catalog found with name: " + this.uri.domain;
            }
            
            if(!catalog.hasPackage(this.uri.file)) {
                throw "planet catalog '" + this.uri.domain + "' does not contain package with name: " + this.uri.file;
            }
            
            var pkg = catalog.getPackage(this.uri.file);

            if(!pkg.exists()) {
                throw "package not found in catalog or origin of catalog: " + catalog.getPath();                
            }
            
            // Now that we have a concrete path to the package source we can
            // use that path for our own package.
            this.path = pkg.getPath();
            // the originCatalog is used to resolve dependencies for this package
            this.originCatalog = pkg.originCatalog;
            // resolve inherited install method
            if(util.has(this, "catalogOrigin") && util.has(this.catalogOrigin, "installMethod")) {
                if(this.catalogOrigin.installMethod=="inherit") {
                    if(util.has(pkg, "catalogOrigin") && util.has(pkg.catalogOrigin, "installMethod")) {
                        this.catalogOrigin.installMethod = pkg.catalogOrigin.installMethod;
                    } else {
                        this.catalogOrigin.installMethod = "copy";
                    }
                }
            }
            
            // Since we are loading a remote package (external to our sea) we need to lock it
            // to prevent modifications.
            this.locked = true;

*/            

        } else
        if(this.uri.protocol=="http") {
            
            throw new TUSK.TuskError("DPRECATED");
            
            var key = struct.bin2hex(md5.hash(this.uri.url));
            var packagePath = tusk.getCacheDirectory().join(key);
            if(!packagePath.exists()) {
                
                var zipFile = fs.Path(packagePath+".zip");
                if(zipFile.exists()) {
                    zipFile.remove();
                }
    
                print("downloading: " + this.uri.url);
    
                zipFile.write(http.read(this.uri.url, 'b'), 'b');
                
                if(!zipFile.exists() || zipFile.size()==0) {
                    throw "error downloading package from: " + this.uri.url;
                }
    
                new zip.Unzip(zipFile).forEach(function (entry) {
                    if (entry.isDirectory())
                        return;
                    var parts = fs.split(entry.getName());
                    parts.shift(); // name-project-comment ref dirname
                    var path = packagePath.join(fs.join.apply(null, parts));
                    path.dirname().mkdirs();
                    path.write(entry.read('b'), 'b');
                });
                
                if(!packagePath.exists() || !packagePath.isDirectory()) {
                    throw "error extracting zip file: " + zipFile;
                }
            }
    
            this.path = packagePath;
            
            // Since we are dealing with a downloaded package we need to lock it
            // to prevent modifications.
            this.locked = true;
        }    
    }
    return this.path;
}

Package.prototype.exists = function() {
    var path = this.getPath();
    return (path.exists() && path.glob('*').length>0);
}

Package.prototype.validate = function() {

    if(!this.exists()) {
        return false;
    }

    var path = this.getPath();

    if(!path.join("package.json").exists()) {
        return false;
    }
    
    return true;
}

Package.prototype.setSea = function(sea) {
    this.sea = sea;
}

Package.prototype.getSea = function() {
    return this.sea
}

// needed
Package.prototype.save = function() {
    
    if(this.locked) {
        throw "package is locked and cannot be modified";
    }
    
    this.getManifest().save();
}

// needed
Package.prototype.create = function(name) {
    
    if(this.exists()) {
        throw "directory not empty";
    }
    
    var manifest = this.getManifest();
    
    manifest.manifest = {
        name: name
    }
    
    this.validate();
    this.save();
}

Package.prototype.getManifest = function() {
    if(!this.manifest) {
        this.manifest = manifest.Manifest(this.getPath().join("package.json"));
    }
    return this.manifest;
}

Package.prototype.getLocalManifest = function() {
    return manifest.Manifest(this.getPath().join("package.local.json"));
}

Package.prototype.getOriginCatalog = function() {
    if(!this.originCatalog) {
        return null;
    }
    return this.originCatalog;
}

Package.prototype.getName = function() {
    return this.getManifest().manifest.name;    
}

Package.prototype.getRevision = function() {
    if(util.has(this, "catalogOrigin") && this.catalogOrigin.installMethod=="link") {
        return "link";
    }
    var manifest = this.getManifest().manifest;
    if(!util.has(manifest, "revision")) {
        return "latest";
    }
    return manifest.revision;
}

Package.prototype.getOriginInfo = function() {
    var info = {};
    info.url = this.uri.url;
    return info;
}

Package.prototype.getPackagesPath = function() {
    return this.getManifest().getPackagesPath();
}
Package.prototype.getBinPath = function() {
    return this.getManifest().getBinPath();
}
Package.prototype.getLibPath = function() {
    return this.getManifest().getLibPath();
}


Package.prototype.getModulePath = function(path) {
    return this.getLibPath().join(path + ".js");
}



// DEPRECATED
Package.prototype.getDependencies = function(catalog) {
    var dependencies = [],
        names = this.getManifest().getDependencyNames(),
        pkg;

    names.forEach(function(name) {
        pkg = catalog.getPackage(name);
        if(!pkg) {
            throw "could not find package '"+name+"' in catalog '"+catalog.getPath()+"'";
        }
        dependencies.push(pkg);
    });
    return dependencies;
}


// needed
Package.prototype.getPackage = function(name) {
    var pkg;
    this.forEachDependency(function(dependency) {
        if(pkg) {
            return;
        }
        if(dependency.getName()==name) {
            pkg = dependency.getPackage();
        }
    });        
    return pkg;
}



Package.prototype.reinstall = function(locator) {
    
/*

    if(path.exists()) {
        if(!options.force) {
            throw "package already installed";
        } else {
            // NOTE: path.isLink() does not work with rhino on Mac OS X
            try {
                // try and remove it as a link first
                // if it is a directory this will fail
                // we cannot call path.rmtree() without testing this first as
                // it will delete the tree the link points to
                path.remove();
            } catch(e) {
                if(path.isDirectory()) {
                    path.rmtree();
                }
            }
            print('Deleted link/directory at: ' + path);
        }
    }

 */    
    // TODO: Do we want to remove all un-used dependencies as well?
     
//    this.install(locator);  
}

Package.prototype.install = function(locator, options) {
    
    if(!this.sea) {
        throw new TUSK.TuskError("package not a valid install target - it does not belong to a sea");
    }
    var self = this;

    var path = this.getPath();
    path.dirname().mkdirs();

    var message = TUSK.getActive().getTheme().newMessage({
        "path": path,
        "locator": locator.toString(),
        "note": "Installing package '{locator}' to: {path}"
    }, "{note}", "note").finalize();
    
    message.startGroup();
    
    var pkg = TUSK.getActive().getPlanet().getPackage(locator);
    
    var installMethod = "copy";
    
    switch(installMethod) {
        case "link":
            if(path.exists() && options.force) {
                TUSK.getActive().getTheme().newMessage({
                    "path": path,
                    "note": "Removing existing package"
                }, "{note} at path: {path}", "note").finalize();
                path.remove();
            }
            pkg.getPath().symlink(path);
            TUSK.getActive().getTheme().newMessage({
                "sourcePath": pkg.getPath().valueOf(),
                "targetPath": path.valueOf(),
                "note": "Linked package at '{sourcePath}' to: {targetPath}"
            }, "{note}", "note").finalize();
            break;
        case "copy":
        default:
            if(path.exists() && options.force) {
                TUSK.getActive().getTheme().newMessage({
                    "path": path,
                    "note": "Removing existing package"
                }, "{note} at path: {path}", "note").finalize();
                path.rmtree();
            }
            FILE.copyTree(pkg.getPath(), path);
            TUSK.getActive().getTheme().newMessage({
                "sourcePath": pkg.getPath().valueOf(),
                "targetPath": path.valueOf(),
                "note": "Copied package at '{sourcePath}' to: {targetPath}"
            }, "{note}", "note").finalize();
            break;
    }


    // TODO: bin files should only be linked if this package is being installed
    //       as a top-level package into the sea (not if installed as a dependency)
    
    if(UTIL.has(options, "installBinaries") && options.installBinaries) {
    
        // make bins executable and make symlinks
        //  in $SEA/bin
        var bin = this.getBinPath();
        if (bin.isDirectory()) {
            bin.list().forEach(function (name) {
                if(name.substr(0,1)!=".") {
                    var target = bin.join(name);
                    target.chmod(0755);
                    var seaBinPath = self.sea.getBinPath();
                    var source = seaBinPath.join(name);
                    var relative = seaBinPath.to(target);
                    if(!source.exists()) {
                        // TODO: Does not work: target.symlink(source.relative(target));
                        target.symlink(source);
                        
                        TUSK.getActive().getTheme().newMessage({
                            "sourcePath": source.valueOf(),
                            "targetPath": target.valueOf(),
                            "message": "Symlinked binary"
                        }, "{message} '{sourcePath}' to: {targetPath}").finalize();
                    }
                }                
            });
        }
    }
     
    this.installDependencies();

    message.endGroup();
}


Package.prototype.installDependencies = function(type) {

    type = type || "package";

    if(!this.sea) {
        throw new TUSK.TuskError("package not associated with a sea");
    }
    
    var helper = TUSK.getActive().getHelper("installDependencies-verifiedPaths", []);
    
    if(helper.indexOf(this.getPath().valueOf())>=0) {
        TUSK.getActive().getTheme().newMessage({
            "package": this.getName(),
            "note": "Skipping redundant "+type+" dependencies check for package: {package}"
        }, "{note}", "note").finalize();
        return;
    }
    
    helper.push(this.getPath().valueOf());

    var message = TUSK.getActive().getTheme().newMessage({
        "package": this.getName(),
        "note": "Checking "+type+" dependencies for package: {package}"
    }, "{note}", "note").finalize();
    
    
    message.startGroup();
    this.forEachDependency(function(dependency) {
        pkg = dependency.getPackage();
        
        
        if(!pkg.exists()) {

            var message1 = TUSK.getActive().getTheme().newMessage({
                "id": dependency.getId(),
                "name": dependency.getName(),
                "note": "Dependency '{id}' with alias '{name}' not met"
            }, "\0cyan({note}\0)", "note").finalize();
            
            message1.startGroup();

            pkg.install(dependency.getLocator());
            
            if(type=="build") {
                pkg.installDependencies("build");
            }
            
            message1.endGroup();
            
        } else {
            pkg.installDependencies(type);
        }
    }, type);
    message.endGroup();    
}

// needed
Package.prototype.forEachDependency = function(callback, type) {

    type = type || "package";

    var self = this;
    if(!self.sea) {
        throw new TUSK.TuskError("package not associated with a sea");
    }
    var dependencies;
    if(type=="package") {
        dependencies =  self.getManifest().getDependencies();
        // add local dependencies
        // TODO: this should happen in the manifest object with proper merging (overriding)
        var localManifest = self.getLocalManifest();
        if(localManifest.exists()) {
            var localDependencies = localManifest.getDependencies();
            if(localDependencies) {
                localDependencies.forEach(function(dependency) {
                    dependencies.push(dependency);
                });
            }
        }
    } else
    if(type=="build") {
        dependencies =  self.getManifest().getBuildDependencies();
    }
    if(!dependencies) {
        return false;
    }
    dependencies.forEach(function(dependency) {
        callback(DEPENDENCY.Dependency(self.sea, self, dependency));
    });
}

// needed
Package.prototype.getDependency = function(name) {
    var self = this;
    if(!self.sea) {
        throw new TUSK.TuskError("package not associated with a sea");
    }
    var dependencies =  self.getManifest().getDependencies();

    // add local dependencies
    // TODO: this should happen in the manifest object with proper merging (overriding)
    var localManifest = self.getLocalManifest();
    if(localManifest.exists()) {
        var localDependencies = localManifest.getDependencies();
        if(localDependencies) {
            localDependencies.forEach(function(dependency) {
                dependencies.push(dependency);
            });
        }
    }

    if(!dependencies) {
        return false;
    }
    var found = false;
    dependencies.forEach(function(dependency) {
        if(found) {
            return;
        }
        found = DEPENDENCY.Dependency(self.sea, self, dependency);
        if(found.getName()!=name) {
            found = false;
        }
    });
    return found
}




Package.prototype.uninstall = function(sea, options) {
    
    var path = this.getPath();
    
    // delete all linked executables
    var bin = this.getBinPath();
    if (bin.isDirectory()) {
        bin.list().forEach(function (name) {
            if(name.substr(0,1)!=".") {
                var seaBinPath = sea.getBinPath();
                var source = seaBinPath.join(name);
                if(source.exists()) {
                    
                    // TODO: only remove the symlink if it in fact points to our bin dir
                    
                    source.remove();
                }
            }                
        });
    }

    // delete package link or source
    if(fs.match(path, sea.getPackagesPath().join('**')) &&
       this.validate()) {
        
        // NOTE: path.isLink() does not work with rhino on Mac OS X
        try {
            // try and remove it as a link first
            // if it is a directory this will fail
            // we cannot call path.rmtree() without testing this first as
            // it will delete the tree the link points to
            path.remove();
        } catch(e) {
            if(path.isDirectory()) {
                path.rmtree();
            }
        }
        print("Deleted directory at: " + path);
               
    } else {
        throw "cannot uninstall package as it is not valid";
    }
    
    STREAM.print("\0red(TODO: remove dependencies if not used by any other package\0)");
}
