const getOptions = require("./utils/getOptions");
const generateApiMd = require("./core/generateApiMd");


const options = getOptions();
if (!options) {
    return;
}

generateApiMd(options);