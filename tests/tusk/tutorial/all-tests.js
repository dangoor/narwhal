
exports.testCreatePublishPackage = require("./create-publish-package");

if (require.main === module.id)
    require("os").exit(require("test/runner").run(exports));

