// let app = new Vue({
//     el:'#root',
//     data:{
//         name:'张三',
//         message:'是一个男人'
//     }
// })

let rkuohao = /\{\{(.+?)\}\}/g;

// 1. 获取模板
let tmpNode = document.querySelector('#root');
// 2. 拿到数据
let data = {
    name:'张三',
    message:'是一个男人'
}

// 3. 将数据放到模板中
// 使用递归方法
// 在现在的这个案例当中，template 是DOM 元素
// 在真正的Vue 源码当中 是 DOM -> 字符串模板 -> VNode -> 真正的DOM

function compiler( template,data ){
    let chileNode = template.childNodes; // 取出子元素
    for(let i = 0;i<chileNode.length;i++){
        //  nodeType 节点类型 1 元素节点 2 文本节点
        let type = chileNode[i].nodeType;
        if(type === 3){
            // 文本节点，可以判断里面是否有{{}}插值
            let txt = chileNode[i].nodeValue; // 该属性只有文本节点才有意义

            // 有没有双花括号
            txt = txt.replace(rkuohao,( _,g )=>{  // replace 使用正则匹配一次，函数就会调用一次
                                            // 函数的 第 0 个参数，表示匹配到的内容
                                            // 函数的 第 n 个参数，表示正则中的第 n 组
                let key = g.trim(); // 写在双花括号里面的 东西 
                let value = data[ key ];
                return value
            })  

            // 注意:txt 现在和DOM元素是没有关系
            chileNode[ i ].nodeValue = txt;

        }else if (type ===1 ){
            compiler(chileNode[i],data)
        }
    }
}

// 利用模板去生成一个需要被渲染的HTML标签 （准 真正在页面显示的标签）
let generateNode = tmpNode.cloneNode( true ); // 注意：这里是DOM 元素，可以怎么用

// console.log(tmpNode);
compiler( generateNode,data ); // 将坑替换掉
// console.log(generateNode);

// 现在没有生成行的 template ，所以这里是直接在页面中更新的数据，因为DOM 是引用类型

// 4.将渲染好的HTML渲染到页面中
root.parentNode.replaceChild( generateNode,root );

// 我们现在的思路有很大的问题
// 1. Vue 使用的是 虚拟 DOM
// 2. 我们现在只考虑到了单属性 ({{ name }}),而 Vue 中使用了大量的层级 ({{child.name.frisname}})
// 3. 代码没有整合