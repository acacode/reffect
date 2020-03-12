const rollup = require("rollup");
const beautifyJson = require("json-beautify");
const camelCase = require("lodash.camelcase");
const path = require("path");
const fs = require("fs");
const resolve = require("@rollup/plugin-node-resolve");
const terser = require("rollup-plugin-terser").terser;
const typescript = require("@rollup/plugin-typescript");

const allPackagesPeerDepsMap = {
  react: "React",
  "@reffect/core": "reffect"
};

const INPUT_FILENAME = "index.ts";

const inputOutputConfig = (projectDir, fileName, outputFormat, commonOutput = {}) => ({
  input: path.join(projectDir, INPUT_FILENAME),
  output: {
    file: path.join(projectDir, `${fileName}.${outputFormat}.js`),
    format: outputFormat,
    sourcemap: true,
    ...commonOutput
  }
});

const production = plugins => [
  ...plugins,
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
  })
];

const pathToProject = process.cwd();
const pathToPackageJson = path.resolve(pathToProject, "package.json");
const packageJson = JSON.parse(fs.readFileSync(pathToPackageJson).toString());

const fileName = packageJson.name
  .replace("@", "")
  .replace("/", "-")
  .replace("core", "")
  .replace(/-$/g, "");

const deps = Object.keys(packageJson.dependencies || {});
const peerDeps = Object.keys(packageJson.peerDependencies || {});

const allDeps = [...deps, ...peerDeps].filter((value, index, arr) => arr.indexOf(value) === index);

Object.assign(packageJson, {
  source: INPUT_FILENAME,
  main: `${fileName}.cjs.js`,
  typings: INPUT_FILENAME,
  "umd:main": `${fileName}.umd.js`,
  "jsnext:main": `${fileName}.es.js`,
  module: `${fileName}.es.js`,
  files: ["LICENSE", INPUT_FILENAME, `${fileName}.*.js`, `${fileName}.*.js.map`]
});

fs.writeFileSync(pathToPackageJson, beautifyJson(packageJson, null, 2, 35));

const tsPlugin = () => {
  return typescript({
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
    sourceMap: true,
    strictNullChecks: true,
    suppressImplicitAnyIndexErrors: true,
    exclude: ["dist", "node_modules", "**/*.spec.ts"]
  });
};

[
  // Common JS builds
  {
    ...inputOutputConfig(pathToProject, fileName, "cjs"),
    external: id => allDeps.includes(id),
    context: pathToProject,
    plugins: production([tsPlugin()])
  },
  // EcmaScript builds
  {
    ...inputOutputConfig(pathToProject, fileName, "es"),
    external: id => allDeps.includes(id),
    context: pathToProject,
    plugins: production([tsPlugin()])
  },
  // UMD builds
  {
    ...inputOutputConfig(pathToProject, fileName, "umd", {
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
    }),
    external: id => allDeps.includes(id),
    context: pathToProject,
    plugins: production([resolve({ jsnext: true }), tsPlugin()])
  }
].map(async bundleOptions => {
  const bundle = await rollup.rollup(bundleOptions);
  await bundle.write(bundleOptions.output);
});
