let rkuohao = /\{\{(.+?)\}\}/g;

/** 将 虚拟DOM 转换成真正的 DOM  */
function parseVNode( vnode ){
    // 创建真实的 DOM
    let type = vnode.type;
    let _node = null;
    if(type === 3){ // 文本节点
        return document.createTextNode( vnode.value );
    }else if( type === 1 ){ // 元素节点 

        _node = document.createElement( vnode.tag );

        // 属性
        let data = vnode.data;  //现在啊这个 data 是键值对
        Object.keys( data ).forEach( ( key ) => {
            let attrName = key;
            let attrValue = data[ key ];
            _node.setAttribute( attrName,attrValue );
        } )
        // 子元素
        let children = vnode.children;
        children.forEach( subvnode => {
            _node.appendChild( parseVNode( subvnode ) );    //递归转换子元素 ( 虚拟DOM )
        } );

        return _node;
    }
}

// 柯里化函数获取对象层级
function createGetValueByPath( obj,path ){
    let paths = path.split('.'); // [xxx,yyy,zzz]
    let res = obj;
    let prop;
    while( prop = paths.shift() ){
        res = res[ prop ];
    }
    return res
}

/*  虚拟DOM 构造函数 **/
class VNode {
    /*
        @ tag:      标签名
        @ data:     描述属性
        @ value:    描述文本
        @ type:     1元素/3文本
    */
    constructor( tag,data,value,type ){
        this.tag        =  tag && tag.toLowerCase();
        this.data       = data;
        this.value      = value;
        this.type       = type;
        this.children   = [];
    }
    appendChild( vnode ){
        this.children.push( vnode );
    }
}

/** 由HTML 生成 虚拟DOM:将这个函数当作compiler 函数 */
function getVNode ( node ){
    let nodeType = node.nodeType;
    let _vnode = null;
    if(nodeType === 1){
        let nodeName = node.nodeName;
        let attrs = node.attributes;
        let _attrObj = {};
        for( let i =0;i< attrs.length;i++ ){    // attrs[ i ] 属性节点 ( nodeType == 2 ) 
            _attrObj[ attrs[ i ].nodeName ] = attrs[ i ].nodeValue;
        }

        _vnode = new VNode( nodeName,_attrObj,undefined,nodeType );

        // 考虑子节点
        let childNodes = node.childNodes;
        for( let i = 0;i < childNodes.length;i++ ){
            _vnode.appendChild( getVNode( childNodes[i] ) ); // 递归
        }

    }else if( nodeType === 3 ){
        _vnode = new VNode( undefined,undefined,node.nodeValue,nodeType );
    }

    return _vnode;
}

/** 将带有“坑”的 VNode 与数据结合，得到填充数据的 VNode 去模拟 AST -> VNode */
function combine( vnode,data ){
    let _type       = vnode.type;
    let _data       = vnode.data;
    let _value      = vnode.value;
    let _tag        = vnode.tag;
    let _children   = vnode.children;
    
    let _vnode = null;

    if( _type === 3 ){ // 文本节点
        _value = _value.replace( rkuohao,function( _,g ){
            return createGetValueByPath( data,g.trim() );
        } )
        _vnode = new VNode( _tag,_data,_value,_type );

    }else if( _type === 1 ){ // 元素节点
        _vnode = new VNode( _tag,_data,_value,_type );
        _children.forEach( _subvnode => _vnode.appendChild( combine( _subvnode,data ) ) );
    }

    return _vnode;
}


function HLVue( options ){
    // this._options = options;
    this._data = options.data;
    let elm = document.querySelector( options.el ); // 再 Vue 中是字符串，这里是 DOM
    this._template =  elm;
    this._parent = elm.parentNode;

    this.mount(); // 挂载
}

HLVue.prototype.mount = function (){

    // 需要提供一个render 方法：生成一个 虚拟DOM

    // if( typeof this._options === "function" )  return;

    this.render = this.createRenderFn(); // 带有缓存的 ( Vue本身是带有 render 成员的 )

    this.mountComponent();
}

/** 挂载组件 */
HLVue.prototype.mountComponent = function (){

    // 执行 mountComponent() 函数
    let mount = ()=>{
        this.update( this.render() );
    }

    mount.call( this ); // 本质上因该交给 watcher 来调用，但是还没有到 watcher

    // 为什么不这样使用？？？
    //this.update( this.render ); // 因为这里需要 发布订阅模式，渲染和计算的行为因该交给 watcher 来完成
}

/*
    在真正的 Vue 中使用了 二次提交的 设计结构
    1. 在页面中 的 DOM 和 虚拟DOM 是一一对应的
    2. 现有 AST 和 数据生成 VNode ( 新，render )
    3. 将 旧的 VNode 和 新的 VNode 进行比较( diff ),更新 ( update )
*/

// 这里是生成 render函数，目的是缓存抽象语法树，（ 使用 虚拟DOM 来描述 ）
HLVue.prototype.createRenderFn = function (){

    let ast = getVNode( this._template );
    // 将 AST + data = VNode
    // 现在：带“坑”的 VNode + data => 含有数据的 VNode
    return function render(){
        // 将带坑的 VNode 转换为 带数据的 VNode
        let _tmp = combine( ast,this._data );
        return _tmp;
    }
}

// 将 虚拟DOM 渲染到页面中：diff 算法就在这里
HLVue.prototype.update = function ( vnode ){
    // 简化，直接生成 HTML DOM replaceChild 到页面中
    // 父元素.replaceChild( 新元素，旧元素 );

    let realDOM = parseVNode ( vnode );

    this._parent.replaceChild( realDOM,document.querySelector( '#root' ) );

    // 这个算法是不责任的
    // 每次会将页面中的 DOM 全部替换

}

let app = new HLVue({
    el:'#root',
    data:{
        name:'张三',
        age:'19',
        work:'程序员'
    }
})