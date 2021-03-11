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
function combine( vnode,data ){ // 出发了 get 读取器
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

    reactify( this._data,this /** 将 Vue 实例传入，折中的处理 */ );
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

// 响应式化的处理部分
let ARRAY_METHOD = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice',
];

// 思路，原型式继承：修改原型链的结构
// 继承关系：arr -> Array.prototype -> Object.prototype -> ...
// 继承关系：arr -> 改写方法 -> Array.prototype -> Object.prototype -> ...

let array_methods = Object.create( Array.prototype );

ARRAY_METHOD.forEach( method =>{
    array_methods[ method ] = function(){

        // 调用原来的方法
        console.log( `调用的是拦截的 ${ method } 方法` );

        // 将数组的数据进行响应化
        for( let i=0;i<arguments.length;i++ ){
            reactify( arguments[ i ] );
        }

        let res = Array.prototype[ method ].apply( this,arguments );
        // let res = Array.prototype[ method ].call( this,...arguments ); // 类比
        return res

    }
} )

// 简化后的版本
function defineReactive( target,key,value,enumerable ){
    // 函数内部就是一个局部作用域，这个 value 就只在函数内部使用的变量 ( 闭包 )
    // 折中了以后们就是 Vue 实例

    let that = this;

    if(  typeof value === "object" && value !=null && !Array.isArray( value ) ){
        // 是非数组的引用类型 
        reactify( value );
    }

    Object.defineProperty( target,key,{
        configurable:true,
        enumerable:!!enumerable,
        get(){
            console.log(`读取${ key } 的属性`);
            return value
        },
        set( newVal ){
            console.log(`设置${ key } 的属性为 ${ newVal } `);
            value = newVal;

            // 模板刷新，（ 现在是假的，只是演示一下 ）
            // 没有 Vue 示例，在以后 watcher 的时候会完善
            that.mountComponent();
        }
    } )
}

//将对象 o 响应化
function reactify( o,vm ){
    let keys = Object.keys( o );

    for( let i = 0;i < keys.length;i++ ){
        let key = keys[ i ]; // 属性名
        let value = o[ key ];

        // 判断这个属性是不是引用类型，判断是不是数组
        // 如果是引用类型就需要递归，如果不是就不用递归
        // 如果不是引用类型，需要使用 defineReactive 将其变成响应式的
        // 如果是引用类型，还是需要使用 defineReactive 将其变成响应式的
        // 如果是数组？就需要循环数组，然后将数组里面的元素进行响应化
        if( Array.isArray( value ) ){   // 判断是不是数组,如果是们就需要循环了，然后递归

            // 数组
            value.__proto__ = array_methods; // 数组就可以响应式了

            for( let j=0;j<value.length;j++ ){
                reactify( value[ j ],vm );
            }
            
        }else { //不是一个数组
                //但是有可能不是引用类型，我们就需要递归
            defineReactive.call( vm,o,key,value,true );
        }
        
        // 只需要在这里添加代理即可（ 问题：在这里写的代码会递归 ）
        // 如果在这里 将属性映射到 Vue 实例上，那么就表示 Vue 实例就可以使用属性 Key
    }
}

let app = new HLVue({
    el:'#root',
    data:{
        name:'张三',
        age:'19',
        work:'程序员',
        list:[
            { msg:'好难啊!!!' },
            { msg:'太难啊!!!' },
            { msg:'真的难啊!!!' }
        ]
    }
})

// 修改数据的时候，模板更新一下 ？？？