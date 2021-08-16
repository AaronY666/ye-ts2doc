/* eslint-disable import/no-extraneous-dependencies */
const { transformFromAstSync } = require("@babel/core");
const parser = require("@babel/parser");
const fs = require("fs");
const apiDocPlugin = require("../plugin/getJsonPlugin");

module.exports = function getJson(filePath, option) {
    const sourceCode = fs.readFileSync(filePath, {
        encoding: "utf-8",
    });

    const ast = parser.parse(sourceCode, {
        sourceType: "unambiguous",
        plugins: ["typescript", "classProperties"],
    });

    transformFromAstSync(ast, sourceCode, {
        plugins: [
            [apiDocPlugin, option],
        ],
    });

    return option.result;
}