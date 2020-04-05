const path = require("path");

module.exports = {
  project: process.cwd(),
  packageJson: path.resolve(process.cwd(), "package.json")
};
