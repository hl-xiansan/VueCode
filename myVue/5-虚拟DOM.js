// 虚拟Dom
/**
 * 1. 为什么要使用虚拟DOM
 *      提供 Vue 的性能
 * 2. 元素节点
 *      { tag:"div" }
 * 3. 文本节点
 *      { tag:undefind,value:'文本内容' }
 * 4. 有属性的节点
 *      { tag:'div',data:{ class:'a1',id:'app' } }
 * 5. 包含子节点
 *      { tag:'div',children:[
 *          { tag:'div' }
 *      ] }
 */


// 虚拟 DOM  构造函数
class VNode{
    /**
     * 
     * @param {*} tag       元素
     * @param {*} value     文本
     * @param {*} data      属性   
     * @param {*} type      1元素/3文本
     */
    constructor( tag,value,data,type ){
        this.tag = tag && tag.toLowerCase();
        this.value = value;
        this.data = data;
        this.type = type;
        this.children = [];
    }
    appendChild( vnode ){
        this.children.push( vnode )
    }
}

/** 传入元素节点，转换 虚拟DOM
 * 
 * @param {*} node 元素节点
 */
function Vnode( node ){
    let nodeType = node.nodeType;
    let _vnode=null;
    if( nodeType === 1 ){   // 元素节点
        let nodeName = node.nodeName;
        let attr = node.attributes;
        let attrObj = {};
        for( let i=0;i<attr.length;i++ ){
            attrObj[ attr[ i ].nodeName ] = attr[ i ].nodeValue
        };
        _vnode = new VNode( nodeName,undefined,attrObj,nodeType );
        // 考虑子节点
        let childs = node.childNodes
        for( let i=0;i<childs.length;i++ ){
            _vnode.appendChild( Vnode( childs[ i ] ) );
        }


    }else if( nodeType === 3 ){ // 文本节点
        _vnode= new VNode( undefined,node.nodeValue,undefined,nodeType )
    }

    return _vnode
}

let root = document.querySelector( "#root" );

let vnode =   Vnode( root );

// 把虚拟DOM 转换为真正的 DOM
function parseVNode( vnode ){
    let type = vnode.type;
    let nodeName = vnode.tag;
    let node = null;
    if( type === 1 ){   // 文本节点
        node = document.createElement( nodeName );
        let data = vnode.data;
        let keys = Object.keys( data );
        let chidrens = vnode.children;
        for( let i=0;i<keys.length;i++ ){
            let key = keys[ i ];
            node.setAttribute( key,data[ key ] );
        }
        // 考虑子节点
        for( let i=0;i<chidrens.length;i++ ){
            node.appendChild( parseVNode( chidrens[ i ] ) )
        }
    }else if( type ===3 ){
        node = document.createTextNode( vnode.value );
    }
    return node;
}

let Dom =   parseVNode( vnode );

root.parentNode.replaceChild( Dom,root );

console.log(root,Dom);