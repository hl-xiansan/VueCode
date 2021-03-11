let rkuohao = /\{\{(.+?)\}\}/g
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
    this.$parent = this.$el.parentNode;

    this._data = opction.data
    this._vnode = null;
    // this.render();
    this.mount();
  }
  mount(){

    this.render = this.CreateRenderFn();    // 带有缓存的 （ Vue 本身 是带有 render 成员的 ）
    this.mountComponent();
  }
  
  mountComponent(){
    // 执行  mountComponent 函数 
    let mount = ()=>{
        this.update( this.render() );
    }
    mount.call( this ); // 本质上因该交给 watcher,但是现在还没有 watcher
    /** 
     *  为什么不这样使用 ？？？ this.update( this.render() )
     * 因为这里需要 发布订阅者模式，渲染和计算的行为 因该交给 watcher 来完成
     */
  }
  update( real ){
      let realDom = parseVnode( real );
      this.$parent.replaceChild( realDom,this.$el );
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
    list:{
      a:{
        b:'层级数据'
      }
    }
  }
})