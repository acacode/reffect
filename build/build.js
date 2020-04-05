/** Build script for all packages */

const paths = require("./paths");
const { rollup } = require("rollup");
const camelCase = require("lodash.camelcase");
const resolve = require("@rollup/plugin-node-resolve");
const replace = require("@rollup/plugin-replace");
// const typescriptApi = require("typescript");
const { updatePackageJson } = require("./utils/updatePackageJson");
const { createBuildConfig } = require("./utils/createBuildConfig");
const { allPackagesPeerDepsMap, inputFileName, packageJson, fileName, peerDeps, externalDeps } = require("./constants");

const buildConfigsMap = {
  // Common JS builds
  cjs: createBuildConfig({
    inputFileName,
    outputFileName: fileName,
    outputFormat: "cjs",
    externalDeps,
    projectPath: paths.project
  }),
  // EcmaScript builds
  es: createBuildConfig({
    inputFileName,
    outputFileName: fileName,
    outputFormat: "es",
    externalDeps,
    projectPath: paths.project
  }),
  // UMD builds
  umd: createBuildConfig({
    inputFileName,
    outputFileName: fileName,
    outputFormat: "umd",
    externalDeps,
    projectPath: paths.project,
    commonOutput: {
      name: camelCase(fileName),
      globals: peerDeps.reduce(
        (globalsMap, peerDep) =>
          allPackagesPeerDepsMap[peerDep]
            ? {
                ...globalsMap,
                [peerDep]: allPackagesPeerDepsMap[peerDep]
              }
            : globalsMap,
        {}
      )
    },
    plugins: [
      replace({
        // TODO: probably it should be sets from package config (?)
        //       currently this variable contains in @reffect/logger only.
        "process.env.NODE_ENV": JSON.stringify("development")
      }),
      resolve({ jsnext: true })
    ]
  })
};

updatePackageJson(paths.packageJson, {
  ...packageJson,
  /** --- specific package.json fields for dev. usage --- */
  source: inputFileName,
  main: buildConfigsMap.cjs.outputFileName,
  typings: inputFileName,
  "umd:main": buildConfigsMap.umd.outputFileName,
  "jsnext:main": buildConfigsMap.es.outputFileName,
  module: buildConfigsMap.es.outputFileName,
  /** --------------------------------------------------- */

  /** list of files which contains in installed package */
  files: ["LICENSE", inputFileName, `${fileName}.*.js`, `${fileName}.*.js.map`]
});

Promise.all(
  Object.values(buildConfigsMap).map(async ({ rollupConfig }) =>
    (await rollup(rollupConfig)).write(rollupConfig.output)
  )
).catch(e => {
  console.error(e);
  process.exit(1);
});
