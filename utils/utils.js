const doctrine = require("doctrine");

function getParams(path) {
    const params = path.get("params").map((p) => {
        let defaultValue;
        if (p.type === "AssignmentPattern") {
            // 存在默认值的情况
            const rightP = p.get("right");
            p = p.get("left");
            defaultValue = rightP.node.value;
        }

        const paramType = p.getTypeAnnotation().typeAnnotation;
        const paramName = p.node.name;

        return {
            name: paramName,
            type: getType(paramType),
            defaultValue,
        };
    });
    return params;
}

function getLeadingComments(path) {
    const comments = [];
    const { leadingComments } = path.node;
    if (leadingComments) {
        leadingComments.map((node) => {
            comments.push(node.value);
        });
    }
    return comments[0];
}

function getReturnType(path) {
    const returnNode = path.get("returnType").node
    if (!returnNode) {
        return 666;
    }
    const returnType = returnNode.typeAnnotation;
    return getType(returnType, path);
}

function getType(tsItem, path) {
    if (!tsItem) {
        return "none"
    }

    let result;
    if (tsItem.types) {
        // 组合类型
        result = tsItem.types.map((typeItem) => getType(typeItem, typeItem.path));
    } else if (tsItem.type === "TSTypeReference") {
        // 接口类型
        let typeName = tsItem.typeName.name;
        // 泛型作为参数传入
        if (tsItem.typeParameters) {
            typeName += "<";
            tsItem.typeParameters.params.forEach((item, idx) => {
                idx !== 0 && (typeName += ",");
                typeName += getType(item, path);
            });
            typeName += ">";
        }

        return typeName;
    } else if (tsItem.members) {
        let objRes = "{";
        // 对象类型
        tsItem.members.forEach((item) => {
            const key = item.key.name;
            const type = item.typeAnnotation.typeAnnotation;
            objRes += `${key}:`;
            objRes += `${getType(type)};`;
        });
        objRes += "}";
        return objRes;
    } else if (tsItem.type === "TSArrayType") {
        //数组类型
        const typeItem = getType(tsItem.elementType);
        return typeItem + "[]";

    } else {
        [, result] = (tsItem.type.match(/TS(.+)Keyword/));
        result = result.toLowerCase();
    }

    return result;
}

function parseComment(commentStr) {
    if (!commentStr) {
        return {};
    }
    return doctrine.parse(commentStr, {
        unwrap: true,
    });
}

module.exports = {
    getParams,
    getLeadingComments,
    getReturnType,
    parseComment,
    getType
}