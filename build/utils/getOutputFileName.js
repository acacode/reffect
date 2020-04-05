const getOutputFileName = (fileName, moduleFormat, fileFormat = "js") => `${fileName}.${moduleFormat}.${fileFormat}`;

module.exports = {
  getOutputFileName
};
