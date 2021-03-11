let rkuohao = /\{\{(.+?)\}\}/g;


let depid = 0;
class Dep{
    constructor(){
        this.id = depid++;
        this.subs = []; // 储存的是与 当前的 Dep 关联的 watcher
    }
    /**
     * 
     * @param {*} sub 添加一个 watcher
     */
    addSub( sub ){
        this.subs.push( sub );
    }

    /** 移除 */
    removeSub( sub ){
        for( let i=this.subs.length;i>=0;i-- ){
            if( sub === this.subs[ i ] ){
                this.subs.splice( i,1 );
            }
        }
    }

    /** 将当前 Dep 与当前的 watcher ( 暂时渲染 watcher ) 关联*/
    depend(){
        // 就是将 当前的 dep 与当前的 watcher 互相关联
        if( Dep.target ){

            this.addSub( Dep.target ); // 将 当前的 watcher 关联到 当前的 dep 上

            Dep.target.addDep( this ); // 将当前的 dep 与 当前渲染 watcher 关联起来

        }
    }

    /** 触发与之关联的 watcher 的 update 方法, 起到更新的作用 */
    notify() {
        // 在真实的 Vue 中是依次触发 this.subs 中的 watcher 的 update 方法
        // 此时, deps 中已经关联到 我们需要使用的 那个 watcher 了
        
        let deps = this.subs.slice();

        deps.forEach( watcher => {

            watcher.update();

        } );

    }
}

// 全局的容器存储渲染 Watcher
Dep.target = null;

let targetStack = [];

/**     将当前操作的 watcher 储存到 全局的 watcher 中
 * 
 * @param {*} target 当前的 watcher
 */
function pushTarget( target ){
    targetStack.unshift( Dep.target ); // Vue 的源代码中使用的是 push
    Dep.target = target;
}

/** 将当前的 Watcher 踢出 */
function popTarget(){
    Dep.target = targetStack.shift(); // 踢出最后就是 undefind
}

/**
 * 在 watcher 调用 get 方法的时候，调用 pushTarget( this )
 * 在 watcher 的 get 方法结束的时候，调用 popTarget()
 */



let watcherid = 0;
/**
 * Wathcer 观察者，用于 发射更新的行为
 */
class Watcher{
    /**
     * @param {Object} vm      HLVue 实例
     * @param { String | Function } expOrfn 如果是渲染Wathcer,传入的就是 渲染函数，如果是计算 Wathcer,传入的就是路径表达式，暂时只考虑 exPorFn 为函数的情况
     */
    constructor( vm,expOrfn ){
        this.vm = vm;
        this.getter = expOrfn;

        this.id = watcherid++;

        this.deps = []; // 依赖项
        this.depIds = {}; // 这是一个 Set 类型，用于保证 依赖项的唯一性（ 简化的代码暂时不实现这一块 ）

        // 一开始需要渲染：真实的 Vue 中：this.lazy ? undefind : this.get()
        this.get();
    }
    /** 计算，触发 getter */
    get(){

        pushTarget( this );

        /**
         * 处理上下文
         */
        this.getter.call( this.vm,this.vm ); 

        popTarget();

    }
    /**
     * 执行，并判断的是懒加载，还是同步执行，还是异步执行
     * 我们现在只考虑 异步加载 （ 嘉华的是 同步执行 ）
     */
    run(){
        this.get();
        // 在真正的 Vue 中是调用 queueWatcher,来触发 nextTick 进行异步的执行
    }
    /** 对外公布的函数，用于在 属性发生变化是触发的接口 */
    update(){
        this.run();
    }
    /** 清空依赖队列 */
    cleanupDep(){

    }
    /**
     * 
     * @param {*} dep  将当前的 dep 与 当前的watcher 关联
     */
    addDep( dep ){
        this.deps.push( dep )
    }
}

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
   /**
    * @param {*} tag    标签名
    * @param {*} data   描述属性
    * @param {*} value  描述文本
    * @param {*} type   1元素/3文本
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

    this.initData(); // 将 data 进行响应化转换，进行代理

    this.mount(); // 挂载

    // reactify( this._data,this /** 将 Vue 实例传入，折中的处理 */ );
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
        console.log('渲染了');

        this.update( this.render() );
    }

    // mount.call( this ); // 本质上因该交给 watcher 来调用，但是还没有到 watcher

    // 为什么不这样使用？？？
    //this.update( this.render ); // 因为这里需要 发布订阅模式，渲染和计算的行为因该交给 watcher 来完成


    new Watcher( this,mount );

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

    console.log(realDOM);

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

/**
 * 数组方法重写
 */
ARRAY_METHOD.forEach( method =>{
    array_methods[ method ] = function(){

        // 调用原来的方法
        console.log( `调用的是拦截的 ${ method } 方法` );

        // 将数组的数据进行响应化
        for( let i=0;i<arguments.length;i++ ){
            observer( arguments[ i ] ); // 这里还是有一个问题，引入 watcer 解决
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

    if(  typeof value === "object" && value !=null ){
        // 是非数组的引用类型 
        observer( value );
    }
    
    let dep = new Dep();

    dep.__proName__ = key;


    Object.defineProperty( target,key,{
        configurable:true,
        enumerable:!!enumerable,
        get(){
            // console.log(`读取${ key } 的属性`);  //额外
            // 依赖收集
            dep.depend();
            return value
        },
        set( newVal ){
            // console.log(`设置${ key } 的属性为 ${ newVal } `);   //额外

            // 将重新赋值的数据变成响应式的，因此如果传入的是对象类型，那么就需要使用 observer 将其转换成响应式的
            if( typeof newVal === "object" && newVal !=null ){
                observer( newVal); 
            }
            value=newVal

            // 模板刷新，（ 现在是假的，只是演示一下 ）
            // 没有 Vue 示例，在以后 watcher 的时候会完善
            // typeof that.mountComponent === "function" &&  that.mountComponent();
            
            /**
             * 临时：数组现在没有产于渲染
             * 所以在数组上进行响应式的处理，不需要页面的刷新
             * 那么 即使 这里无法调用 也没有关系
             */

            // 派发更新，找到全局的watcher,调用 update
            dep.notify();
        }
    } )
}

//将对象 o 响应化
// function reactify( o,vm ){
//     let keys = Object.keys( o );　// 没有对 o 本身进行响应式化处理，是对 o 的成员进行响应式化处理

//     for( let i = 0;i < keys.length;i++ ){
//         let key = keys[ i ]; // 属性名
//         let value = o[ key ];

//         // 判断这个属性是不是引用类型，判断是不是数组
//         // 如果是引用类型就需要递归，如果不是就不用递归
//         // 如果不是引用类型，需要使用 defineReactive 将其变成响应式的
//         // 如果是引用类型，还是需要使用 defineReactive 将其变成响应式的
//         // 如果是数组？就需要循环数组，然后将数组里面的元素进行响应化
//         if( Array.isArray( value ) ){   // 判断是不是数组,如果是们就需要循环了，然后递归

//             // 数组
//             value.__proto__ = array_methods; // 数组就可以响应式了

//             for( let j=0;j<value.length;j++ ){
//                 reactify( value[ j ],vm );
//             }
            
//         }else { //不是一个数组
//                 //但是有可能不是引用类型，我们就需要递归
//             defineReactive.call( vm,o,key,value,true );
//         }
        
//         // 只需要在这里添加代理即可（ 问题：在这里写的代码会递归 ）
//         // 如果在这里 将属性映射到 Vue 实例上，那么就表示 Vue 实例就可以使用属性 Key
//     }
// }


HLVue.prototype.initData = function(){
    // 遍历 this._data 的成员，将属性转换为 响应式 ，将直接属性 ，代理到实例上

    let keys = Object.keys( this._data );

    // 响应式化
    observer( this._data,this )

    // 代理
    for( let i=0;i<keys.length;i++ ){
        // 这里将 this._data[ keys[ i ] ] 映射到 this[ keys[ i ] ] 上
        proxy( this,'_data',keys[ i ] )
    }
};

function proxy( target,prop,key ){
    Object.defineProperty( target,key,{
        enumerable:true,
        configurable:true,
        get(){
            return target[ prop ] [ key ] 
        },
        set( newVal ){
            target[ prop ] [ key ] = newVal;
        }
    } )
}

/**
 * 将对象 obj 变成响应式的
 * 
 * @param {*} obj 
 * @param {*} vm    Vue 实例，为了调用时，处理上下文
 */
function observer( obj,vm ){
    // 之前没有对 obj 本身进行操作
    if( Array.isArray( obj ) ){
        // 对数组的每一个元素进行处理
        obj.__proto__ = array_methods;
        for( let i=0;i<obj.length;i++ ){
            observer( obj[ i ],vm ); // 递归处理每一个数组元素
        }
    }else{
        // 对其成员进行处理
        let keys = Object.keys( obj );
        for( let i=0;i<keys.length;i++ ){
            let prop = keys[ i ]; // 属性名
            defineReactive.call( vm,obj,prop,obj[ prop ],true );
        }
    }
}

let app = new HLVue({
    el:'#root',
    data:{
        name:'张三',
        age:'19',
        work:'程序员',
        father:'数据',
        list:[
            { msg:'好难啊!!!' },
            { msg:'太难啊!!!' },
            { msg:'真的难啊!!!' }
        ]
    }
})

// 修改数据的时候，模板更新一下 ？？？