let rkuohao = /\{\{(.+?)\}\}/g;

/** 柯里化函数获取层级
 * 
 * @param {*} path 
 * @returns 
 */
function CreateGetByPath( path ){
    let paths = path.split( '.' );
    return function getByPath( obj ){
        let res = obj;
        let prop;
        while( prop = paths.shift() ){
            res = res[ prop ];
        }
        return res;
    }
}

/** 数据驱动
 * 
 * @param {*} opction 
 * @param {*} data 
 */
function compiler( opction,data ){
    let childs = opction.childNodes;
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
                    let getByPath = CreateGetByPath( key );
                    let value = getByPath( data );
                    return value;
                } );
            childs[ i ].nodeValue = txt;

        }else if( nodeType ===1 ){  //元素节点
            compiler( childs[ i ],data );   // 递归处理
        }
    }
}

function Vue( opction ){
    this._el = opction.el;
    this._data = opction.data;

    this.$el = document.querySelector( this._el );
    this._parent = this.$el.parentNode;

    this.render();
}

Vue.prototype.render = function(){
    this.compiler();
}
Vue.prototype.compiler = function(){
    let realDom = this.$el.cloneNode( true );
    compiler( realDom,this._data );
    this.update( realDom );
}
Vue.prototype.update = function( real ){
    this._parent.replaceChild( real,this.$el );
}

let app = new Vue({
    el:'#root',
    data:{
        name:'张三',
        msg:'是一个男人',
        age:"18",
        a:{
            b:{
                c:'层级数据'
            }
        }
    }
})