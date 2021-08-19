const readline = require('readline');
const fs = require('fs');

module.exports = function generateMd(result, options) {
    const { methods, props } = result;
    const { template } = options;
    let mdStr = "";

    mdStr = handleProps(mdStr, props, template && template.props);
    mdStr = handleMethods(mdStr, methods, template && template.methods);
    return mdStr;
};

function handleProps(mdStr, props, tempPath) {
    props.forEach(propItem => {
        let propStr = "";
        const {
            name,
            type,
            defaultValue,
            comment,
            readonly
        } = propItem;
        const { description } = comment;

        const matchData = {
            name,
            type,
            default: defaultValue,
            description,
            readonly
        }

        if (tempPath) {
            propStr += handleTemplate(tempPath, matchData) + "\n";
        } else {
            propStr += `### ${name}\n`
            propStr += `- **Description:** ${description||"none"}\n`
            propStr += `- **Type:** \`{ ${type||"none"} }\`\n`

            if (defaultValue) {
                propStr += `- **Default:** \`${defaultValue}\`\n`;
            }
            if (readonly) {
                propStr += `- **Readonly:** \`true\`\n`;
            }
        }

        mdStr += propStr + "\n";
    })

    return mdStr;
}

function handleMethods(mdStr, methods, tempPath) {
    methods.forEach((fnItem) => {
        const {
            fnName,
            comment,
            params,
            returnType,
        } = fnItem;

        const { description } = comment;

        const matchData = {
            fnName,
            params,
            description,
            returnType
        }

        let fnStr = "";
        if (tempPath) {
            fnStr += handleTemplate(tempPath, matchData) + "\n";
        } else {
            // 拼接函数名
            fnStr += `### ${fnName}()\n`;

            // 拼接描述
            fnStr += `- **Description:** ${description || "none"}\n`;

            // 拼接参数
            const { tags } = comment;
            if (params.length) {
                fnStr += "- **Arguments:**\n";
                params.forEach((paramItem, idx) => {
                    let paramType = "";
                    if (Array.isArray(paramItem.type)) {
                        paramItem.type.forEach((type, i) => {
                            if (i !== 0) {
                                paramType += " | ";
                            }
                            paramType += type;
                        });
                    } else {
                        paramType = paramItem.type;
                    }

                    fnStr += `  - \`{ ${paramType} } ${paramItem.name}\` - ${tags && tags[idx] && tags[idx].description || "none"}\n`;
                });
            }

            // 拼接返回值
            fnStr += `- **Returns:** \`{ ${returnType} }\`\n`;

            if (tags && tags.length) {
                const usageItem = tags.find((item) => item.title === "Usage");
                if (usageItem) {
                    fnStr += "- **Usage:**\n";
                    fnStr += `
                \`\`\`js
                ${usageItem.description}
                \`\`\`
                \n`;
                }
            }
        }
        mdStr += fnStr + "\n";
    });
    return mdStr;

}

function handleTemplate(tempPath, data) {
    const templateFile = fs.readFileSync(tempPath, "utf-8");

    let str = "";

    const arr = templateFile.split("\n");
    arr.forEach(lineStr => {

        //找到需要替换的占位符
        lineStr = replaceWordWithData(lineStr, data);
        lineStr && (str += lineStr + "\n");
    })

    return str;
}

function replaceWordWithData(str, data) {
    const matchReg = /[$?]{([\w.]+)}/;
    let matchArr = str.match(matchReg);

    //默认是否拼接，如果没有占位符则一定拼接
    let ifConcat = !matchArr;

    //第一次先把非数组类型的占位符全部替换
    while (matchArr = matchReg.exec(str)) {
        //判断需要替换的值是否存在
        const [matchStr, matchKey] = matchArr; //${name} name
        const matchValue = data[matchKey]

        if (matchKey.indexOf(".") > -1) { //${name.title}
            //如果占位符是数组类型
            const [key] = matchKey.split('.'); //name
            const arrValue = data[key]

            //如果不是数值类型的值则返回
            if (!arrValue || !Array.isArray(arrValue)) {
                continue;
            }

            //把已经找到值的数组标识拿掉
            str = str.replace(new RegExp(key + ".", "g"), ""); //name. => ""

            let strList = "";
            arrValue.forEach((item, idx) => {
                strList += replaceWordWithData(str, {
                    ...data,
                    ...item
                });

                if (idx !== arrValue.length - 1) {
                    strList += "\n";
                }
            })

            str = strList;
            str && (ifConcat = true);
            continue;
        }

        if (matchValue || matchStr.indexOf("$") > -1) {
            //这一行任何一个占位符有值的话,或者设置了必选占位符，都会拼接上去，否则这句话会被省略
            ifConcat = true;
        }

        //替换掉当前匹配到的占位符
        str = str.replace(matchReg, matchValue || "");

        //下一轮

    }

    return ifConcat ? str : "";

}