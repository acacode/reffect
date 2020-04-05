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
  plugins = []
}) => {
  const outputFileNameWithFormat = getOutputFileName(outputFileName, outputFormat);
  const inputPathToFile = path.join(projectPath, inputFileName);
  const outputPathToFile = path.join(projectPath, outputFileNameWithFormat);

  return {
    outputFormat,
    outputFileName: outputFileNameWithFormat,
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
      external: id => externalDeps.includes(id),
      context: projectPath,
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

module.exports = {
  createBuildConfig
};
