const { declare } = require("@babel/helper-plugin-utils");
const { getParams, getLeadingComments, getReturnType, parseComment, getType } = require("../utils/utils");


const apiDocPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);
    return {
        pre(file) {
            file.set("docs", []);
            file.set("props", []);
        },
        visitor: {
            Function(path, state) {
                const { accessibility, kind, type } = path.node;
                if (options.publicOnly && accessibility && accessibility !== "public" || kind === "constructor") {
                    return;
                }

                let fnName;
                const fnType = type;
                if (fnType === "FunctionDeclaration") {
                    fnName = path.get("id").toString();
                } else {
                    fnName = path.get("key").toString();
                }

                let readOnly;
                //处理get，判断是否是只读的
                if (kind === "get") {
                    readOnly = true;
                    path.parentPath.traverse({
                        ClassMethod(p) {
                            //如果有set方法则不是只读的,直接返回
                            if (p.node.kind === "set" && p.node.key.name === fnName) {
                                readOnly = undefined;
                                path.stop();
                            }
                        }
                    })
                    if (!readOnly) {
                        return;
                    }
                }

                const params = getParams(path);

                const returnType = getReturnType(path);

                const comment = parseComment(getLeadingComments(path));

                const result = {
                    fnName,
                    fnType,
                    accessibility,
                    params,
                    returnType,
                    comment,
                    readOnly
                };

                const docs = state.file.get("docs");
                docs.push(result);

                path.skip();
            },
            ClassProperty(path, state) {
                const { accessibility } = path.node;
                if (options.publicOnly && accessibility !== "public") {
                    return;
                }
                const propName = path.get("key").toString();
                const typeAnnotation = path.getTypeAnnotation().typeAnnotation;
                const propType = getType(typeAnnotation);
                const value = path.get("value").toString();
                const comment = parseComment(getLeadingComments(path));

                const result = {
                    name: propName,
                    type: propType,
                    defaultValue: value,
                    comment,
                };

                const props = state.file.get("props");
                props.push(result);
            }

        },
        post(file) {
            const methods = file.get("docs");
            const props = file.get("props");

            options.result = {
                methods,
                props
            };
            // const { outputPath, name } = options;


            // fs.outputJson(`${outputPath}/${name}.json`, docs);
        },
    };
});

module.exports = apiDocPlugin;