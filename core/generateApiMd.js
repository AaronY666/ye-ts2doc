/* eslint-disable import/no-extraneous-dependencies */
const fs = require("fs-extra");
const getJson = require("./getJson");
const getMdStr = require("./getMdStr");

module.exports = function getApiMd(option) {
    const { input, output, filename } = option;
    const result = getJson(input, option);
    const markdownStr = getMdStr(result);

    fs.outputFile(`${output}/${filename||"defaultDoc.md"}`, markdownStr);
}