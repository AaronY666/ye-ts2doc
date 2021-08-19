/* eslint-disable import/no-extraneous-dependencies */
const fs = require("fs-extra");
const path = require("path");
const getJson = require("./getJson");
const getMdStr = require("./getMdStr");
const readFiles = require("../utils/readFiles");

module.exports = function getApiMd(option) {
    const { input, output, filename, excludes, clean } = option;

    //用于存储不同文件下的输出结果
    const outputStore = {};

    const callback = (absPath, relPath, name) => {

        // let fName;
        let outputFile;
        if (filename && filename.match(/\[name\]/) || !filename) {
            //判断配置的filename是否存在占位符[name],存在或者没有设置filename会以目录生成出来
            let fName = filename && filename.replace(/\[name\]/g, name) || (name + "md");

            outputFile = path.join(output, relPath, fName);

        } else {
            //如果filename没有占位符，而且存在，那么不管是目录还是单文件最后都生成到这个文档里面去
            outputFile = path.join(output, filename);
        }

        const result = getJson(absPath, option);
        const markdownStr = getMdStr(result, option);

        //添加到结果中去
        if (markdownStr) {
            outputStore[outputFile] = outputStore[outputFile] || [];
            outputStore[outputFile].push(markdownStr);
        }
    }

    readFiles({
        input,
        excludes,
    }, callback);


    //是否清除根目录
    clean && cleanOutput(output);

    //输出最后的文件
    writeOutputFiles(outputStore);

}

function cleanOutput(output) {
    fs.removeSync(output);
}

function writeOutputFiles(outputStore) {
    for (let key in outputStore) {
        const mdStrList = outputStore[key];
        //合并所有文件下的mdStr
        let resStr = "";
        mdStrList.forEach(str => {
            resStr += str;
        })

        //输出最终的结果
        fs.outputFile(key, resStr);
    }
}