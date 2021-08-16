const options = require(`${process.cwd()}/ts2doc.config`);
const generateApiMd = require("./core/generateApiMd");

generateApiMd(options);