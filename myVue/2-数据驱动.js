let rkuohao = /\{\{(.+?)\}\}/g;


/** 数据驱动核心函数
 * 
 * @param {*} template Dom元素
 * @param {*} data 数据
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


/** Vue 构造函数
 * 
 * @param {*} opction 
 */
function Vue( opction ){
    this._data = opction.data;
    this._el =  opction.el;

    // 准备工作
    this.$el =  document.querySelector( this._el );
    this._parent = this.$el.parentNode;

    // 渲染
    this.render();
}

Vue.prototype.render = function(){
    this.compiler();
}

Vue.prototype.compiler = function(){
    let realHtmlDom = this.$el.cloneNode( true );
    compiler( realHtmlDom,this._data );
    this.update( realHtmlDom );
}

Vue.prototype.update = function( real ){
    this.$el.parentNode.replaceChild( real,this.$el );
}


let app = new Vue({
    el:'#root',
    data:{
        name:'张三',
        msg:'是一个男人',
        age:'29'
    }
});