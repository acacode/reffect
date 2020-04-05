const fs = require("fs");
const beautifyJson = require("json-beautify");

const beautifyOptions = {
  spaces: 2,
  columnsLimit: 35
};

const updatePackageJson = (pathToPackageJson, packageJsonData) =>
  fs.writeFileSync(
    pathToPackageJson,
    beautifyJson(packageJsonData, null, beautifyOptions.spaces, beautifyOptions.columnsLimit)
  );

module.exports = {
  updatePackageJson
};
