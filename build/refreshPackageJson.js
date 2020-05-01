const paths = require("./paths");
const { updatePackageJson } = require("./utils/updatePackageJson");
const { buildConfigs } = require("./configs");
const { inputFileName, packageJson } = require("./constants");

const allOutputFileNames = Object.values(buildConfigs).reduce(
  (outputFileNames, { outputFiles }) => [...outputFileNames, ...outputFiles],
  []
);

const refreshPackageJson = () => {
  updatePackageJson(paths.packageJson, {
    ...packageJson,
    /** --- specific package.json fields for dev. usage --- */
    source: inputFileName,
    typings: buildConfigs.dts.outputFileName,
    main: buildConfigs.cjs.outputFileName,
    "umd:main": buildConfigs.umd.outputFileName,
    "jsnext:main": buildConfigs.es.outputFileName,
    "typescript:main": inputFileName,
    module: buildConfigs.es.outputFileName,
    /** --------------------------------------------------- */

    /** list of files which contains in installed package */
    files: ["LICENSE", inputFileName, ...allOutputFileNames]
  });
};

module.exports = {
  refreshPackageJson
};
