/** Build script for all packages */

const { rollup } = require("rollup");
const beautifyJson = require("json-beautify");
const camelCase = require("lodash.camelcase");
const path = require("path");
const fs = require("fs");
const resolve = require("@rollup/plugin-node-resolve");
const terser = require("rollup-plugin-terser").terser;
const replace = require("@rollup/plugin-replace");
const typescript = require("@rollup/plugin-typescript");
// const typescriptApi = require("typescript");

const allPackagesPeerDepsMap = {
  react: "React",
  "@reffect/core": "reffect"
};

const INPUT_FILENAME = "index.ts";

const paths = {
  project: process.cwd(),
  packageJson: path.resolve(process.cwd(), "package.json")
};

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
const allDeps = [...deps, ...peerDeps].filter((value, index, arr) => arr.indexOf(value) === index);

const createBuildConfig = (outputFormat, commonOutput = {}, plugins = []) => {
  const outputFileName = `${fileName}.${outputFormat}.js`;
  const inputPathToFile = path.join(paths.project, INPUT_FILENAME);
  const outputPathToFile = path.join(paths.project, outputFileName);

  return {
    outputFormat,
    outputFileName,
    inputPathToFile,
    outputPathToFile,
    rollupConfig: {
      input: inputPathToFile,
      output: {
        file: outputPathToFile,
        format: outputFormat,
        sourcemap: true,
        ...commonOutput
      },
      external: id => allDeps.includes(id),
      context: paths.project,
      plugins: [
        terser({
          compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            warnings: false,
            arguments: true,
            unsafe_Function: true,
            module: true,
            passes: 15
          }
        }),
        typescript({
          allowJs: false,
          allowSyntheticDefaultImports: true,
          lib: ["dom", "esnext"],
          module: "es2015",
          target: "esnext",
          moduleResolution: "node",
          strict: true,
          noImplicitAny: true,
          noImplicitReturns: true,
          noImplicitThis: true,
          noUnusedLocals: true,
          sourceMap: false,
          strictNullChecks: true,
          suppressImplicitAnyIndexErrors: true,
          exclude: ["node_modules", "**/*.spec.ts"]
        }),
        ...plugins
      ]
    }
  };
};

const buildConfigsMap = {
  // Common JS builds
  cjs: createBuildConfig("cjs"),
  // EcmaScript builds
  es: createBuildConfig("es"),
  // UMD builds
  umd: createBuildConfig(
    "umd",
    {
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
    [
      replace({
        // TODO: probably it should be sets from package config (?)
        //       currently this variable contains in @reffect/logger only.
        "process.env.NODE_ENV": JSON.stringify("development")
      }),
      resolve({ jsnext: true })
    ]
  )
};

// automate update package json object (for cases when needs to add/update property in package.json file of the package)
fs.writeFileSync(
  paths.packageJson,
  beautifyJson(
    Object.assign(packageJson, {
      /** --- specific package.json fields for dev. usage --- */
      source: INPUT_FILENAME,
      main: buildConfigsMap.cjs.outputFileName,
      typings: INPUT_FILENAME,
      "umd:main": buildConfigsMap.umd.outputFileName,
      "jsnext:main": buildConfigsMap.es.outputFileName,
      module: buildConfigsMap.es.outputFileName,
      /** --------------------------------------------------- */

      /** list of files which contains in installed package */
      files: ["LICENSE", INPUT_FILENAME, `${fileName}.*.js`, `${fileName}.*.js.map`]
    }),
    // replacer
    null,
    // spaces
    2,
    // columns limit
    35
  )
);

Promise.all(
  Object.values(buildConfigsMap).map(async ({ rollupConfig }) =>
    (await rollup(rollupConfig)).write(rollupConfig.output)
  )
).catch(e => {
  console.error(e);
  process.exit(1);
});
