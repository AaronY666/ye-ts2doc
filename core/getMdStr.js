module.exports = function generateMd(result) {
    const { methods, props } = result;
    let mdStr = "";

    mdStr = handleProps(mdStr, props);
    mdStr = handleMethods(mdStr, methods);
    return mdStr;
};

function handleProps(mdStr, props) {
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
        propStr += `### ${name}\n`;
        propStr += `- **Description:** ${description||"none"}\n`;
        propStr += `- **Type:** \`{ ${type||"none"} }\`\n`;
        if (defaultValue) {
            propStr += `- **Default:** \`${defaultValue}\`\n`;
        }

        if (readonly) {
            propStr += `- **Readonly:** \`true\`\n`;
        }

        mdStr += propStr;
    })

    return mdStr;
}

function handleMethods(mdStr, methods) {
    methods.forEach((fnItem) => {
        const {
            fnName,
            comment,
            params,
            returnType,
        } = fnItem;

        let fnStr = "";

        // 拼接函数名
        fnStr += `### ${fnName}()\n`;

        // 拼接描述
        const { description } = comment;
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

        mdStr += fnStr;
    });
    return mdStr;

}