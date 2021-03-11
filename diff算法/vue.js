

/**生成虚拟DOM 构造函数
 * 
 * @param {*} tag 元素
 * @param {*} data 属性
 * @param {*} value 文本
 * @param {*} type 1元素/3文本
 */
function VNode(
    tag,
    data,
    value,
    type
) {
    this.tag = tag && tag.toLowerCase();
    this.data = data;
    this.value = value;
    this.type = type;
    this.childrens = [];
}

VNode.prototype.appendChild = function appendChild(vnode) {
    this.childrens.push(vnode)
}

/** 生成 虚拟 DOM */
function setVnode(node) {
    var nodeType = node.nodeType;
    var _vnode = null;
    if (nodeType === 1) {//元素节点
        var nodeName = node.nodeName;
        var attrs = node.attributes;
        var attrObj = {};
        for (var i = 0; i < attrs.length; i++) {
            attrObj[attrs[i].nodeName] = attrs[i].nodeValue
        }
        _vnode = new VNode(nodeName, attrObj, undefined, nodeType);
        // 考虑子节点
        var childrens = node.childNodes;
        for (var i = 0; i < childrens.length; i++) {
            _vnode.appendChild(setVnode(childrens[i]));
        }
    } else if (nodeType === 3) {
        _vnode = new VNode(undefined, undefined, node.nodeValue, nodeType);
    }
    return _vnode;
}

/**
 * 
 * @param {*} oldVNode 旧虚拟DOM
 * @param {*} newVNode 新虚拟DOM
 */
function patch( oldVNode,newVNode ){
    let vnode = null;
    // 判断老虚拟DOM,是不是虚拟DOM
    if( oldVNode.sel === "" || oldVNode.sel === undefined ){    // 不是虚拟DOM
        vnode = setVnode( oldVNode );
    }
    console.log(vnode);
}

patch( root )
