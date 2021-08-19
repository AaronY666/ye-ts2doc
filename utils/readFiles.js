const fs = require("fs-extra");
const path = require("path")
module.exports = function readFiles(option, callback) {
    const {
        input,
        relativePath = "",
        excludes,
    } = option;

    const stat = fs.statSync(input);
    if (excludes && input.match(excludes)) {
        return;
    }
    if (stat.isDirectory()) {
        const dirName = path.basename(input);
        const relPath = path.join(relativePath, dirName);

        const files = fs.readdirSync(input);
        files.forEach(filePath => {
            const absPath = path.join(input, filePath);
            readFiles({
                input: absPath,
                relativePath: relPath,
                excludes,
            }, callback);
        })
    } else {
        const ext = path.extname(input);
        if (ext === ".ts") {
            const absPath = input;
            const relPath = relativePath;
            const [filename] = path.basename(input).split(".");

            callback && callback(absPath, relPath, filename);
        }
    }

}