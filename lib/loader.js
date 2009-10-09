
// NOTE: this file is used is the bootstrapping process,
// so any "requires" must be accounted for in narwhal.js

var system = require("system");
// HACK: the stars prevent the file module from being sent to browser
//  clients with the regexen we're using.  we need a real solution
//  for this.
var file = require(/**/"file"/**/);

// this gets swapped out with a full fledged-read before
//  we're done using it
var read = file.read;

exports.Loader = function (options) {
    var loader = {};
    var factories = options.factories || {};
    var paths = options.paths;
    var extensions = options.extensions || ["", ".js"];
    var timestamps = {};
    var debug = options.debug;

    loader.resolve = exports.resolve;

    loader.resolvePkg = function(id, baseId, pkg, basePkg) {
        return exports.resolvePkg(loader, id, baseId, pkg, basePkg);
    };

    loader.find = function (topId) {
        // if it's absolute only search the "root" directory.
        // file.join() must collapse multiple "/" into a single "/"
        var searchPaths = file.isAbsolute(topId) ? [""] : paths;

        for (var j = 0; j < extensions.length; j++) {
            var extension = extensions[j];
            for (var i = 0; i < searchPaths.length; i++) {
                var path = file.join(searchPaths[i], topId + extension);
                if (file.isFile(path))
                    return path;
            }
        }
        throw new Error("require error: couldn't find \"" + topId + '"');
    };

    loader.fetch = function (topId, path) {
        if (!path)
            path = loader.find(topId);
        if (typeof file.mtime === "function")
            timestamps[path] = file.mtime(path);
        if (debug)
            print('loader: fetching ' + topId);
        var text = read(path, {
            'charset': 'utf-8'
        });
        // we leave the endline so the error line numbers align
        text = text.replace(/^#[^\n]+\n/, "\n");
        return text;
    };

    loader.evaluate = function (text, topId) {
        if (system.evaluate) {
            var fileName = loader.find(topId);
            var factory = system.evaluate(text, fileName, 1);
            factory.path = fileName;
            return factory;
        } else {
            return new Function("require", "exports", "module", "system", "print", text);
        }
    };

    loader.load = function (topId) {
        if (!Object.prototype.hasOwnProperty.call(factories, topId)) {
            loader.reload(topId);
        } else if (typeof file.mtime === "function") {
            var path = loader.find(topId);
            if (loader.hasChanged(topId, path))
                loader.reload(topId);
        }
        return factories[topId];
    };

    loader.reload = function (topId, path) {
        factories[topId] = loader.evaluate(loader.fetch(topId, path), topId);
    };

    loader.isLoaded = function (topId) {
        return Object.prototype.hasOwnProperty.call(factories, topId);
    };

    loader.hasChanged = function (topId, path) {
        if (!path)
            path = loader.resolve(topId);
        return (
            !Object.prototype.hasOwnProperty.call(timestamps, path) ||
            file.mtime(path) > timestamps[path]
        );
    };

    loader.paths = paths;
    loader.extensions = extensions;

    return loader;
};

exports.resolve = function (id, baseId) {
    if (typeof id != "string")
        throw new Error("module id '" + id + "' is not a String");
    if (id.charAt(0) == ".") {
        id = file.dirname(baseId) + "/" + id;
    }
    return file.normal(id);
};

exports.resolvePkg = function(loader, id, baseId, pkg, basePkg) {
    
    if(loader["pkgCatalog"]) {
        var found,
            path;
        
        // the calling package
        var callingPkgId,
            callingPkgInfo;
            
        // if pkg is an absolute path we assume it points to a package
        // and "id" should be loaded from that package
        if(pkg && ((path = system.fs.Path(pkg)).exists())) {
            pkg = path.join("").valueOf(); // add a slash at the end to ensure path matching will work
            found = false;
            loader.pkgCatalog["packages"].forEach(function(pkgInfo) {
                if(found) {
                    return;
                }
                if(pkg.substr(0,pkgInfo[0].length)==pkgInfo[0]) {
                    path = pkgInfo[1].libPath;
                    found = true;
                }
            });
            if(!found) {
                throw "require(<module>,<pkg>) error: could not find pkg: " + pkg;
            }
            // if "id" is absolute we load it directly with "pkg" as the parent package
            if(system.fs.Path(id).exists()) {
                // TODO: not sure what what baseId would be significant for here
                return [exports.resolve(id, baseId), pkg];
            } else {
                // id is relative to pkg so we need to use the pkg's path as the baseId
                return [exports.resolve("./" + id, path), pkg];
            }
        }

        // no package context is known yet            
        if(!pkg && !basePkg) {
            // establish baseId based on id (typically for narwhal/lib modules)
            if(!baseId) {
                callingPkgId = loader.find(exports.resolve(id)).valueOf();
                // if loader is a MultiLoader we need to get the id
                if(callingPkgId["length"] && callingPkgId.length==2) {
                    callingPkgId = callingPkgId[1];
                }
            }
        } else
        if(pkg && !basePkg) {
            // we want a specific pkg but no basePkg is set yet
            // we assume pkg is found in sea (typically all calls to the sandboxe's require)
            callingPkgId = pkg;
        } else
        if(!pkg && basePkg) {
            // we want a module from our basePkg
            callingPkgId = basePkg;
        } else
        if(pkg && basePkg) {
            // we want a module from pkg aliased in basePkg
            callingPkgId = basePkg;
        }

        // based on callingPkgId determine owning package
        // this compares the callingPkgId (absolute path) to the package paths
        // if callingPkgId is not an absolute path it already is a fully-qualified package ID for the sea
        found = false;
        if(system.fs.Path(callingPkgId).exists()) {
            // callingPkgId is a full path - get info by matching path
            loader.pkgCatalog["packages"].forEach(function(pkgInfo) {
                if(found) {
                    return;
                }
                if(callingPkgId.substr(0,pkgInfo[0].length)==pkgInfo[0]) {
                    callingPkgId = pkgInfo[1].name;
                    callingPkgInfo = pkgInfo[1];
                    found = true;
                }
            });
        } else {
            // callingPkgId is a complete package ID - get info by name
            loader.pkgCatalog["packages"].forEach(function(pkgInfo) {
                if(found) {
                    return;
                }
                if(callingPkgId==pkgInfo[1].name) {
                    callingPkgInfo = pkgInfo[1];
                    found = true;
                }
            });
        }

        // now that we have the calling package (callingPkgId) we can resolve
        // id relative to pkg (and baseId) if provided
        if(pkg) {
            
            if(!found) {
                // The callingPkgId could not be resolved.
                // This is a configuration/user error.
                // It happens when a "pkg" is requested from a 
                // a "basePkg" that does not define "pkg" as a dependency alias.
                // Typically the "basePkg" context is incorrect and the module calling
                // the require() should have been loaded with a different package context from
                // the module needing it.
                // A package context can be forced (without needing to be aliased via a dependency)
                // by providing an absolute path for pkg.
                
                throw "require(<module>,<pkg>) error: the calling package based on '" + basePkg +
                      "' does not define pkg '" + pkg + "' as a dependency. You typically need to change "+
                      "the package context of '" + baseId + "' or any of it\'s parent modules via "+
                      "require(...,<pkg>) where <pkg> can be a full path to the package if needed.";
            }
            
            // if pkg is an alias (does not start with ".")
            if(pkg.substr(0,1)!=".") {

                if(callingPkgInfo.packages[pkg]) {
                    // map the pkg alias to the top-level package ID
                    pkg = callingPkgInfo.packages[pkg];
                } else {
                    // no alias defined in calling package
                    // find libPath for pkg
                }
               
                // pkg is now a fully qualified top-level package ID
                found = false;
                loader.pkgCatalog["packages"].forEach(function(pkgInfo) {
                    if(found) {
                        return;
                    }
                    if(pkg==pkgInfo[1].name) {
                        path = pkgInfo[1].libPath;
                        found = true;
                    }
                });
                
                if(!found) {
                    
                    // if the pkg was not found and is a full dependency ID
                    // we re-write it to a simple name to identify a sea package
                    if(pkg.split("/")[0]=="dependencies") {
                        var seaPkgName = loader.pkgCatalog["seaPackage"];
                        if(!seaPkgName) {
                            throw "require(<module>,<pkg>) error: sea package name not found while trying to resolve: " + pkg;
                        }
                        found = false;
                        var seaPkgInfo;
                        loader.pkgCatalog["packages"].forEach(function(pkgInfo) {
                            if(found) {
                                return;
                            }
                            if(seaPkgName==pkgInfo[1].name) {
                                seaPkgInfo = pkgInfo[1];
                                found = true;
                            }
                        });
                        if(!found) {
                            throw "require(<module>,<pkg>) error: sea package '" + seaPkgName +
                                  "' not found while trying to resolve: " + pkg;
                        }
                        found = false;
                        var name;
                        for( name in seaPkgInfo.packages ) {
                            if(seaPkgInfo.packages[name]==pkg) {
                                found = true;
                                break;
                            }
                        }
                        if(!found) {
                            throw "require(<module>,<pkg>) error: sea package '" + seaPkgName +
                                  "' does not define dependency: " + pkg;
                        }
                        // we can now finally try and find the lib path for the package
                        found = false;
                        loader.pkgCatalog["packages"].forEach(function(pkgInfo) {
                            if(found) {
                                return;
                            }
                            if(name==pkgInfo[1].name) {
                                path = pkgInfo[1].libPath;
                                found = true;
                            }
                        });
                        if(!found) {
                            throw "require(<module>,<pkg>) error: package not found after resolving " +
                                  "it as a sea dependency: " + pkg;
                        }

                        // build module id based on target package lib path
                        return [exports.resolve("./" + id, path + "/"), name];
                    } else {
                        throw "require(<module>,<pkg>) error: package not found: " + pkg;
                    }
                }
                // build module id based on target package lib path
                return [exports.resolve("./" + id, path + "/"), callingPkgId];
            } else {
                // pkg is a relative file path
                return [exports.resolve(id, baseId), callingPkgId];
            }
        } else {
            // no pkg provided - resolve id relative to pkgId and baseId
            return [exports.resolve(id, baseId), callingPkgId];
        }
    } else {
        // no pkgCatalog - fall back to default
        return [exports.resolve(id, baseId), null];
    }
};
