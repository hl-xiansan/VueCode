let rkuohao = /\{\{(.+?)\}\}/g

// 数据响应式
// 数组方法拦截
let ARRAY_METHOD = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice',
];

let array_methods = Object.create( Array.prototype );

ARRAY_METHOD.forEach( method => {
    array_methods[ method ] = function(){
        console.log(`调用的是拦截的 ${ method } 方法`);
        let res = Array.prototype[ method ].apply( this,arguments );
        return res
    }
} )


function reactify( o,vm ){
    let keys = Object.keys( o ); 
    for( let i=0;i<keys.length;i++ ){
        let key = keys[ i ];
        let value = o[ key ];
        if( Array.isArray( value ) ){
            value.__proto__ = array_methods;
            let Kes = Object.keys( value );
            for( let j=0;j<Kes.length;j++ ){
                reactify( value[ Kes[ i ] ],vm );
            }
        } else{
            defineReactive.call( vm,o,key,value,true )
        }
    }
}

// 改写 reactify 为 observer 方法
function observer( o,vm ){
  if( Array.isArray( o ) ){
    obj.__proto__ = array_methods;
    o.forEach( v=>{
      observer( v,vm );
    } )
  }else{
    // 对其成员进行处理
    let keys = Object.keys( o );
    for( let i=0;i<keys.length;i++ ){
        let prop = keys[ i ]; // 属性名
        defineReactive.call( vm,o,prop,o[ prop ],true );
    }
  }
}

/**   代理方法
 * 
 * @param {object} target 
 * @param {string} prop 
 * @param {string} key 
 */
function proxy( target,prop,key ){
  Object.defineProperty( target,key,{
    enumerable:true,
    configurable:true,
    get(){
      return target[ prop ][ key ]
    },
    set( newVal ){
      target[ prop ][ key ] = newVal
    }
  } )
}

/** 封装 Object.defineProperty() 方法 
 * 
 * @param {object} target 
 * @param {string} key 
 * @param {string} value 
 * @param {boolean} enumerable 
 */
 function defineReactive( target,key,value,enumerable ){
   let that = this;
   let dep = new Dep();
    Object.defineProperty( target,key,{
        configurable:true,
        enumerable:!!enumerable,
        get(){
            console.log(key);
            dep.depend();
            return value;
        },
        set( newVal ){
            value = newVal;
            that.mountComponent();
        }
    } )
}

// 生成虚拟DOM
function GetVNode( node ){
  let nodeType = node.nodeType;
  let _vnode = null;
  if( nodeType === 1 ){
    let nodeName = node.nodeName;
    let attrs = node.attributes;
    let attrObj = {};
    for( let i=0;i<attrs.length;i++ ){
      attrObj[ attrs[ i ].nodeName ] = attrs[ i ].nodeValue
    }
    _vnode = new VNode( nodeName,attrObj,undefined,nodeType )

    let children = node.childNodes;
    for( let i=0;i<children.length;i++ ){
      _vnode.appendChild( GetVNode( children[ i ] ) );
    }
  }else if( nodeType === 3 ){
    _vnode = new VNode( undefined,undefined,node.nodeValue,nodeType );
  }

  return _vnode
}

/** 获取模板数据
 * 
 * @param {*} data 
 * @param {string} path 
 */
function GetValueByPath( data,path ){
  let paths = path.split( "." );
  let res = data;
  let prop;
  while( prop = paths.shift() ){
    res = res[ prop ];
  }
  return res;
}

/** 将带“ 坑 ” 的 VNode 与数据结合，得到填充的VNode 去模拟 AST->VNode */
function compiler( vnode,data ){
  let type = vnode.type;
  let _vnode = null;
  let tag = vnode.tag;
  let attrObj = vnode.data;
  let children = vnode.children;
  let value = vnode.value;
  if( type === 1 ){
    _vnode = new VNode( tag,attrObj,value,type );
    children.forEach( vchild=>{
        _vnode.appendChild( compiler( vchild,data ) );
    } )
  }else if( type === 3 ){
    value = value.replace( rkuohao,(_,g)=>{
        g = g.trim();
        return GetValueByPath( data,g );
    } )
    _vnode = new VNode( undefined,undefined,value,type );
  }
  return _vnode;
}

/** 将带 “ 坑 ” 的 VNode 填充数据
 * 
 * @param {Component} vnode 
 * @param {object} data 
 * @returns 
 */
function parseVnode( vnode ){
    let type = vnode.type;
    let node = null;
    let tag = vnode.tag;
    let attrObj = vnode.data;
    let children = vnode.children;
    let value = vnode.value;
    if( type === 1 ){
        node = document.createElement( tag );
        let Keys = Object.keys( attrObj );
        for( let i=0;i<Keys.length;i++ ){
        node.setAttribute( Keys[ i ],attrObj[ Keys[ i ] ] );
        }
        for( let i=0;i<children.length;i++ ){
        node.appendChild( parseVnode( children[ i ] ) );
        }
    }else if( type === 3 ){
        node = document.createTextNode( value )
    }
    return node;
}

// 这里存储全局的watcher

let watcherId = 0;
class Watcher{
  
  constructor( vm,exOrFn ){
    this.vm = vm;
    this.getter = exOrFn;

    this.id = watcherId++;

    this.deps = [];

    
    this.get()

  }
  get(){
    this.getter.call( this.vm );
  }
  run(){

  }
  undate(){

  }
  clearnDep(){

  }
  addDep( dep ){
    this.deps.push( dep );
  }
}

let depid=0;
class Dep{

  constructor(){
    this.id = depid++;
    this.subs = [];
  }
  addSub( sub ){
    this.subs.push( sub );
  }
  depend(){
    if( Dep.target ){
      this.addSub( Dep.target );
      Dep.target.addDep( dep )
    }
  }
}

Dep.target = null




// 虚拟DOM 构造函数
class VNode{
  constructor( tag,data,value,type ){
    this.tag = tag && tag.toLowerCase();
    this.data = data;
    this.value = value;
    this.type = type;
    this.children = []
  }
  appendChild( vnode ){
    this.children.push( vnode )
  }
}

// Vue 构造函数
class Vue{
  constructor( opction ){
    this.$el = document.querySelector( opction.el );
    let elm = document.querySelector( opction.el ); // 再 Vue 中是字符串，这里是 DOM
    this._template =  elm;
    this._parent = elm.parentNode;

    this._data = opction.data
    this._vnode = null;
    this.initData();
    this.mount();

  }
  initData(){
    let keys = Object.keys( this._data );
    
    // 响应式化
    observer( this._data,this );

    // 代理属性
    for( let i=0;i<keys.length;i++ ){
      proxy( this,'_data',keys[ i ] );
    }
  }
  mount(){

    this.render = this.CreateRenderFn();    // 带有缓存的 （ Vue 本身 是带有 render 成员的 ）
    this.mountComponent();
    // reactify( this._data,this );

  }
  
  mountComponent(){
    // 执行  mountComponent 函数 
    let mount = ()=>{
        console.log("渲染了");
        this.update( this.render() );
    }
    // mount.call( this ); // 本质上因该交给 watcher,但是现在还没有 watcher
    /** 
     *  为什么不这样使用 ？？？ this.update( this.render() )
     * 因为这里需要 发布订阅者模式，渲染和计算的行为 因该交给 watcher 来完成
     */

    // 交给 watcher

    new Watcher( this,mount )

  }
  update( real ){
      let realDom = parseVnode( real );
      this._parent.replaceChild( realDom,document.querySelector( '#root' ) );
  }
  /** 这里生成 render 函数，目的是缓存 虚拟DOM */
  CreateRenderFn(){

      let ast = GetVNode( this.$el );
      /**
       * 将 AST + data => VNode
       * render 将带“ 坑 ” 的 VNode + data => 含有数据的 VNode
       */
      return function render(){
        let _tmp = compiler( ast,this._data );
        return _tmp
      }
  }
}

let app = new Vue({
  el:'#root',
  data:{
    name:'张三',
    age:'12',
    test:'测试派发更新',
    list:{
      a:{
        b:'层级数据'
      }
    }
  }
})