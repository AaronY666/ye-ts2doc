const fs = require("fs-extra");
const path = require("path")

module.exports = function getOptions() {
    try {
        const options = require(`${process.cwd()}/ts2doc.config`);
        const { input } = options;
        readFiles(input)

        return options;
    } catch (err) {
        console.log("ts2doc.config.js need to under you project!")
    }
}

function readFiles(input) {
    const stat = fs.statSync(input);
    if (input.match(/node_modules/)) {
        return;
    }
    if (stat.isDirectory()) {
        const files = fs.readdirSync(input);
        files.forEach(filePath => {
            readFiles(path.join(input, filePath));
        })
    } else {
        const ext = path.extname(input);
        if (ext === ".ts") {
            console.log(input);
        }
    }
}