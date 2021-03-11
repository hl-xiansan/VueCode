let rkuohao = /\{\{(.+?)\}\}/g;

// 柯里化函数获取对象层级
function createGetValueByPath( path ){
    let paths = path.split('.'); // [xxx,yyy,zzz]

    return function getValueByPath( obj ){
        let res = obj;
        let prop;
        while( prop = paths.shift() ){
            res = res[ prop ];
        }
        return res
    }
}


function compiler( template,data ){
    let chileNode = template.childNodes; // 取出子元素
    for(let i = 0;i<chileNode.length;i++){
        //  nodeType 节点类型 1 元素节点 2 文本节点
        let type = chileNode[i].nodeType;
        if(type === 3){
            // 文本节点，可以判断里面是否有{{}}插值
            let txt = chileNode[i].nodeValue; // 该属性只有文本节点才有意义

            // 有没有双花括号
            txt = txt.replace(rkuohao,( _,g )=>{  // replace 使用正则匹配一次，函数就会调用一次
                                            // 函数的 第 0 个参数，表示匹配到的内容
                                            // 函数的 第 n 个参数，表示正则中的第 n 组
                let path = g.trim(); // 写在双花括号里面的 东西 
                let value = createGetValueByPath( data,path );
                debugger;
                return value
            })  

            // 注意:txt 现在和DOM元素是没有关系
            chileNode[ i ].nodeValue = txt;

        }else if (type ===1 ){
            compiler(chileNode[i],data)
        }
    }
}

/*
    解决一个问题:
    使用'xxx.yyy.zzz' 可以访问某一个对象
    就是用字符串路径来访问对象的成员
*/
function getValueByPath( obj,path ){
    let paths = path.split('.');
    // 先得到obj.xxx,在取得结果中的yyy，在取得结果中的zzz
    // let res = null;
    // res = obj[ [ path[ 0 ] ] ];
    // res = obj[ [ path[ 1 ] ] ];
    // res = obj[ [ path[ 2 ] ] ];
    let res = obj;
    let prop;
    while( prop = path.shift() ){
        res = res[ prop ];
    };
    return res;
}

function HLVue( options ){
    // 习惯: 内部数据使用下划线 开头，只读数据使用$开头
    this._data = options.data;
    this._el = options.el;

    // 准备工作
    this.$el = this._templateDOM = document.querySelector(this._el); 
    this._parent = this._templateDOM.parentNode;

    // 渲染工作
    this.render();
}

/*  将模板和数据，得到HTML加到页面中    */
HLVue.prototype.render  = function(){
    this.compiler();
}

/*  编译，将模板和数据结合，得到我们真正的DOM元素  */
HLVue.prototype.compiler = function(){
    let realHTMLDOM = this._templateDOM.cloneNode( true ); // 用模板拷贝一个准DOM
    compiler( realHTMLDOM,this._data );
    this.update( realHTMLDOM );
}

/*  将DOM元素，放在页面中  */
HLVue.prototype.update = function( real ){
    this._parent.replaceChild( real,document.querySelector('#root') );
}

// 先想想Vue是如何使用的
let app = new HLVue({
    el:'#root',
    data:{
        name:{
            firstName:'黄黄黄',
            lastName:'亮亮亮'
        }
    }
})