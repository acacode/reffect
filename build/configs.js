const paths = require("./paths");
const camelCase = require("lodash.camelcase");
const resolve = require("@rollup/plugin-node-resolve");
const replace = require("@rollup/plugin-replace");
const dts = require("rollup-plugin-dts").default;
const { createBuildConfig } = require("./utils/createBuildConfig");
const { allPackagesPeerDepsMap, inputFileName, fileName, peerDeps, externalDeps } = require("./constants");

const buildConfigs = {
  dts: createBuildConfig({
    inputFileName,
    outputFormat: "es",
    outputFileName: () => `${fileName}.d.ts`,
    plugins: [dts({})],
    projectPath: paths.project,
    externalDeps,
    defaultPlugins: false,
    sourcemap: false
  }),
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

module.exports = {
  buildConfigs
};
