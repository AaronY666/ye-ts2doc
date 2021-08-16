# ye-ts2doc
This project can help you generate api doc as markdown ,by reading the notes from ts files.

![GitHub package.json version](https://img.shields.io/github/package-json/v/AaronY666/ye-ts2doc?style=plastic)
![npm](https://img.shields.io/npm/v/ye-ts2doc)
### Instalation
```shell
npm install ye-ts2doc -D
```
### Usage
In just two steps, you can convert ts files into API documentation
#### create config
To use ye-ts2doc, you should firstly create the `ts2doc.config.js` under you project.
```js
//ts2doc.config.js
const path = require("path")
module.exports = {
    input: <the file path that the ts file you want to parse>,
    output: <the output path the markdown file generated>,
    filename: <the name of the output markdown file>,
    publicOnly: <if only parse public methods or properties>,
}
```
#### start parse
Next, execute the following command
```shell
ts2doc
```
now , you can find markdown file in you output file!
