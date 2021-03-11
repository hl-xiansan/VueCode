// 数据驱动
let rkuohao = /\{\{(.+?)\}\}/g;
/**
 * 拿到模板
 */
const root = document.querySelector( "#root" );

/**
 * 拿到数据
 */
let data = {
    name:'张三',
    msg:'数据驱动',
}

/** 把数据放在模板里面
 * 
 * @param {Dom} template  拿到的模板
 * @param {Object} data      拿到的数据
 */
function compiler( template,data ){
    let childs = template.childNodes;
    for( let i=0;i<childs.length;i++ ){
        let nodeType = childs[ i ].nodeType;
        if( nodeType === 3 ){   // 文本节点
            let value = childs[ i ].nodeValue;//获取文本节点的文本
            let txt = value.replace( rkuohao,
                /**
                 * 
                 * @param {String} _ 匹配到的内容
                 * @param {String} g 替换之后的内容
                 */
                (_,g)=>{
                    let key = g.trim();
                    let value = data[ key ];
                    return value;
                } );
            childs[ i ].nodeValue = txt;

        }else if( nodeType ===1 ){  //元素节点
            compiler( childs[ i ],data );   // 递归处理
        }
    }
}

let generateNode = root.cloneNode( true ); 

compiler( generateNode,data );

root.parentNode.replaceChild( generateNode,root );