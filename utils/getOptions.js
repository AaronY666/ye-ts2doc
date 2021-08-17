module.exports = function getOptions() {
    try {
        const options = require(`${process.cwd()}/ts2doc.config`);

        //TODO:handle options in this

        return options;
    } catch (err) {
        console.log("ts2doc.config.js need to under you project!")
    }
}