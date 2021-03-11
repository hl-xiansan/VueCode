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

/** 将带 “ 坑 ” 的 VNode 填充数据
 * 
 * @param {Component} vnode 
 * @param {object} data 
 * @returns 
 */
function compiler( vnode,data ){
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
      node.appendChild( compiler( children[ i ],data ) );
    }
  }else if( type === 3 ){
    value.replace( rkuohao,(_,g)=>{
      g = g.trim();
      value = GetValueByPath( data,g );
    } )
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
    this.render();
  }
  render(){
    // 生成 虚拟DOM
    this._vnode = GetVNode( this.$el );
    this.comppiler();
  }
  comppiler(){
    let realDom = compiler( this._vnode,this._data )
    this.update( realDom )
  }
  update( realDom ){
    this.$parent.replaceChild( realDom,this.$el );
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