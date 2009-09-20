
var system = require("system");
var fs = require("file");
var json = require("json");
var util = require("util");
var tusk = require("./tusk");



var Sea = exports.Sea = function (path) {
    if (!(this instanceof exports.Sea))
        return new exports.Sea(path);
    this.path = path;
}

Sea.prototype.exists = function() {
    return this.path.exists();
}

/**
 * Add the sea to the planet tusk config
 */
Sea.prototype.add = function() {
    
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
       !this.path.join(".tusk").exists()) {
        
        return false;
    }
    
    return true;
}

Sea.prototype.create = function(options)
{
    if(this.exists())
        throw "Sea already exists at: " + this.path;
    
    var packageInfo = {};
    if(options)
      util.update(packageInfo, options);

    var path = this.path;

    path.join('.tusk').mkdirs();
    path.join('bin').mkdirs();
    path.join('lib').mkdirs();

    var sea = path.join('bin', 'sea');
    fs.path(system.prefix).join('bin', 'sea').copy(sea);
    sea.chmod(0755);

    var activate = path.join('bin', 'activate.bash');
    fs.path(system.prefix).join('bin', 'activate.bash')
        .copy(activate);
    activate.relative().symlink(activate.resolve('activate'));

    path.join('README').touch();
    path.join('narwhal.conf')
        .write('NARWHAL_DEFAULT_ENGINE=' + system.engine);
    var packagePath = path.join('package.json');
    if (packagePath.isFile())
        util.complete(
            packageInfo, 
            json.decode(packagePath.read({charset:'utf-8'}))
        );
    packagePath.write(
        json.encode(packageInfo, null, 4),
        {charset:'utf-8'}
    );
 
    this.add();
}

exports.list = function()
{
    var tuskConfig = tusk.getPlanetConfig();
    
    if(!tuskConfig.exists() || !util.has(tuskConfig.config, "seas"))
        return [];
    
    return tuskConfig.config.seas;
}
