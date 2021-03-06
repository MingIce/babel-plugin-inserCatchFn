const { declare } = require('@babel/helper-plugin-utils');
const babelPlugin = declare((api, ) => {
    return {
        visitor:{
            Program: {
                enter(path, state) {
                    state.tryCatchAST = api.template.statement(`console.log(13223)`)();
                }
            },
            ExportDefaultDeclaration: (path, state) => {

                // console.log(path.node.specifiers);
                // console.log("path.scope.block.body----->", path.scope.block.body);
                // console.log("tryCatchAST",path.node.declaration);
                //根据当前作用域获取到节点的body
                const parentBody = path.scope.block.body
                // 过滤节点只是export default节点的ast
                const exportsDefaultArr = parentBody?.filter(it => it?.type === 'ExportDefaultDeclaration')
                // console.log("exportsDefaultArr",exportsDefaultArr);
                // return
                // const body = path.scope.block.body[0].declaration.properties
                // 获取method里面的方法，判断啥对象属性的类型ObjectProperty
                const body = exportsDefaultArr[0].declaration.properties
                for(let i =0 ;i< body.length; i++) {
                    if(body[i].type === 'ObjectProperty' && body[i].key.name === 'methods') {
                        // console.log("----------",body[i].value.properties[0].body.body);
                        handlerCatch(body[i].value.properties, state)
                    }
                }
            }
        }
    }
})
const handlerCatch =(body, state) => {
    if(!Array.isArray(body)) return
    body.forEach(it => {
        insertAst(it.body.body, state)
    })
}
// 判断节点类型是try catch然后对catch里面的body进行注入
const insertAst = (body, state) => {
    // console.log("body",body);
    body.forEach(it => {
        if(it.type === 'TryStatement' && it.handler.type === 'CatchClause'){
            // console.log("aaa---->", it.handler.body);
            it.handler.body.body.unshift(state.tryCatchAST)
        }
    })  
}
module.exports = babelPlugin