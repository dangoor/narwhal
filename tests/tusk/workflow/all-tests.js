
//exports.testPackageInstall = require("./package-install");
//exports.testSeaManipulation = require("./sea-manipulation");

if (require.main === module.id)
    require("os").exit(require("test/runner").run(exports));

