/** Build script for all packages */
const { rollup } = require("rollup");
const { buildConfigs } = require("./configs");
const { refreshPackageJson } = require("./refreshPackageJson");

refreshPackageJson();

const rollupBuild = async () => {
  return Object.values(buildConfigs).map(async ({ rollupConfig }) => {
    let build;

    try {
      build = await rollup(rollupConfig);
    } catch (e) {
      console.error("rollup config aggregation error\r\n", e);
      throw e;
    }

    try {
      return await build.write(rollupConfig.output);
    } catch (e) {
      console.error("rollup write output error\r\n", e);
      throw e;
    }
  });
};

rollupBuild()
  .then(outputs => {
    Promise.all(outputs)
      .then(result => {
        console.log("OK", result.length);
      })
      .catch(e => {
        console.error(e);
        process.exit(1);
      });
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
