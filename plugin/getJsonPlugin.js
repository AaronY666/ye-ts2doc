const { declare } = require("@babel/helper-plugin-utils");
const { getParams, getLeadingComments, getReturnType, parseComment, getType, getFunctionName } = require("../utils/utils");


const apiDocPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);
    return {
        pre(file) {
            file.set("docs", []);
            file.set("props", []);
        },
        visitor: {
            Function(path, state) {
                const { accessibility, kind, type: fnType } = path.node;
                //如果是方法且限制了公有方法
                if (options.publicOnly && accessibility && accessibility !== "public" || kind === "constructor") {
                    return;
                }

                //不解析匿名函数
                const fnName = getFunctionName(path);
                if (!fnName) {
                    return;
                }

                //set和get解析后添加到属性队列
                if (kind === "get" || kind === "set") {
                    const res = handleSetterAndGetter(path, fnName);
                    if (res) {
                        const props = state.file.get("props");
                        props.push(res);
                    }

                    return;
                }

                //如果不为get和set，那么只解析有注释的函数
                const comment = parseComment(getLeadingComments(path));
                if (Object.keys(comment).length === 0) {
                    //如果函数没有注释那么直接返回
                    return;
                }

                const params = getParams(path);

                let returnType = getReturnType(path);
                if (!returnType && comment.tags) {
                    comment.tags.forEach(tag => {
                        if (tag.title === "return") {
                            returnType = tag.type.type;
                        }
                    })
                }

                const result = {
                    fnName,
                    fnType,
                    accessibility,
                    params,
                    returnType,
                    comment
                };

                const docs = state.file.get("docs");
                docs.push(result);

                //不解析函数内部定义的函数
                path.skip();
            },
            ClassProperty(path, state) {
                const { accessibility, readonly } = path.node;
                if (options.publicOnly && accessibility && accessibility !== "public") {
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
                    readonly
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
        },
    };
});

function handleSetterAndGetter(path, fnName) {
    const { kind } = path.node;
    const params = getParams(path);

    let readonly;
    const type = params[0] && params[0].type || "unknown";
    //处理get，判断是否是只读的
    if (kind === "get") {
        readonly = true;
        path.parentPath.traverse({
                ClassMethod(p) {
                    //如果有set方法则不是只读的,直接返回
                    if (p.node.kind === "set" && p.node.key.name === fnName) {
                        readonly = undefined;
                        path.stop();
                    }
                }
            })
            //为了只添加一个属性对象，非只读的getter对象在setter里面添加
        if (!readonly) {
            return null;
        }
    }

    const comment = parseComment(getLeadingComments(path))

    return {
        name: fnName,
        type,
        comment,
        readonly
    };
}

module.exports = apiDocPlugin;