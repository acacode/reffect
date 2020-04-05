const paths = require("./paths");
const fs = require("fs");

const allPackagesPeerDepsMap = {
  react: "React",
  "@reffect/core": "reffect"
};

const inputFileName = "index.ts";
// JS object of package.json file
const packageJson = JSON.parse(fs.readFileSync(paths.packageJson).toString());
// converts package name to file name (example: "@reffect/logger" -> "reffect-logger")
const fileName = packageJson.name
  .replace("@", "")
  .replace("/", "-")
  .replace("core", "")
  .replace(/-$/g, "");
// array of dependencies names
const deps = Object.keys(packageJson.dependencies || {});
// array of peer dependencies names
const peerDeps = Object.keys(packageJson.peerDependencies || {});
// array of all dependencies names (except dev dependencies)
const externalDeps = [...deps, ...peerDeps].filter((value, index, arr) => arr.indexOf(value) === index);

module.exports = {
  allPackagesPeerDepsMap,
  deps,
  externalDeps,
  fileName,
  inputFileName,
  packageJson,
  peerDeps
};
