const path = require("path");
const terser = require("rollup-plugin-terser").terser;
const typescript = require("@rollup/plugin-typescript");
const { getOutputFileName } = require("./getOutputFileName");

const createBuildConfig = ({
  inputFileName,
  outputFileName,
  outputFormat,
  projectPath,
  externalDeps,
  commonOutput = {},
  plugins = [],
  defaultPlugins = true,
  sourcemap = true
}) => {
  const outputFileNameWithFormat =
    typeof outputFileName === "function" ? outputFileName() : getOutputFileName(outputFileName, outputFormat);
  const inputPathToFile = path.join(projectPath, inputFileName);
  const outputPathToFile = path.join(projectPath, outputFileNameWithFormat);

  return {
    defaultPlugins,
    sourcemap,
    outputFormat,
    outputFileName: outputFileNameWithFormat,
    inputPathToFile,
    outputPathToFile,
    outputFiles: [outputFileNameWithFormat, sourcemap && `${outputFileNameWithFormat}.map`].filter(Boolean),
    rollupConfig: {
      input: inputPathToFile,
      output: {
        file: outputPathToFile,
        format: outputFormat,
        sourcemap: false,
        ...commonOutput
      },
      external: id => externalDeps.includes(id),
      context: projectPath,
      plugins: [
        defaultPlugins &&
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
        defaultPlugins &&
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
            sourceMap: sourcemap,
            strictNullChecks: true,
            suppressImplicitAnyIndexErrors: true,
            exclude: ["node_modules", "**/*.spec.ts", "**/*.test.ts"]
          }),
        ...plugins
      ].filter(Boolean)
    }
  };
};

module.exports = {
  createBuildConfig
};
