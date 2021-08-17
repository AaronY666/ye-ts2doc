/* eslint-disable import/no-extraneous-dependencies */
const fs = require("fs-extra");
const path = require("path");
const getJson = require("./getJson");
const getMdStr = require("./getMdStr");
const readFiles = require("../utils/readFiles");

module.exports = function getApiMd(option) {
    const { input, output, filename, excludes } = option;

    const callback = (absPath, relPath, name) => {

        let fName;
        if (filename && filename.match(/\[name\]/)) {
            //判断配置的filename是否存在占位符[name]
            fName = filename.replace(/\[name\]/g, name);
        } else if (relPath) {
            //此时解析的是目录，普通的文件名无效
            fName = name + ".md"
        } else {
            fName = filename || "defaultDoc.md";
        }

        const result = getJson(absPath, option);
        const markdownStr = getMdStr(result);
        const outputPath = path.join(output, relPath, fName);
        fs.outputFile(outputPath, markdownStr);
    }

    readFiles({
        input,
        excludes,
    }, callback);


}