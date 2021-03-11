((global,factory)=>{
    typeof exports === 'object' && typeof module !== 'undefined'
    ? module.exports = factory() : typeof define === 'function' && define.amd
    ? define(factory) : (global.Vue = factory());   // //执行factory()函数，将返回值Vue传递给window.Vue
})(this,(function(){
    'use strict'

    // // // // // var // // // // // // //  var   // // // // // // //  var // // // // // // var // // // // 

    var inBrowser = typeof window !== "undefined";

    var idToTemplate = cached( function ( id ){
        let el = query( el );
        return el && el.innerHTML;
    } )

    // // // // // var // // // // // // //  var   // // // // // // //  var // // // // // // var // // // // 




    // // // // // function // // // // // // //  function   // // // // // // //  function // // // // // // function // // // // 

    // 弹出警告
    function warn( val ){
        console.warn( val );
    }

    /** 判断 Vue 是否挂载了 el */
    function query( el ){
        if( el ){
            var selected = document.querySelector( el );
            if( !selected ){
                warn( `你没有挂载节点${ el }` );
            }
            return selected;
        }else{
            return el
        }
    }

    /** 生成 DOM 元素 字符串
     * @param {Component} el DOM节点
     * @returns 返回字符串
     */
    function getOuterHTML( el ){
        if( el.outerHTML ){
            return el.outerHTML
        } else {
            var container = document.createElement( "div" );
            container.appendChild( el.cloneNode( true ) );
            return container.innerHTML;
        }
    }

    function cached( Fn ){
        var cache = Object.create( null );
        return function cachedFn( str ){
            let hit = cache[ str ];
            return hit || ( cache[ str ] = Fn( str ) )
        }
    }

    

    // // // // // function // // // // // // //  function   // // // // // // //  function // // // // // // function // // // // 
    
    var VNode = function VNode( tag,value,data,type ){

    }
    
    function Watcher(){

    }
    
    // Vue 构造函数
    function Vue( opctions ){
        /** 查看 Vue 实例是否挂载了
         * instanceof Vue
         */
        if ("development" !== 'production' && !(this instanceof Vue)) {
            warn('Vue is a constructor and should be called with the `new` keyword');
        }
        
        
        this._init( opctions ) // 1-1 Vue 初始化
    }

    initMixin( Vue );
    

    function initMixin( Vue ){
        /** 1-2 Vue 初始化函数
         * @param {Component} opctions 
         */
        Vue.prototype._init = function( opctions ){
            let vm = this;
            this.$opctions = opctions

            if( this.$opctions.el ){    // 如果 Vue 实例传入 了 挂载 el 节点
                vm.$mount( this.$opctions.el );       
            }
        } 
    }

    // 1-3 $mount 函数
    var mount = Vue.prototype.$mount;   // 保存原型上的 $mount 函数
    Vue.prototype.$mount = function( el,hydrating ){
        el = el && query( el ); // 获取挂载的 DOM 节点
        // 判断是否选择的是 body 或 html 标签
        if( el === document.body || el === document.documentElement ){
            warn( "请不要选择 <body> 或 <html> " );
            // 如果是，停止执行
            return this;
        }
        var opctions = this.$opctions;
        if( !opctions.render ){
            var template = opctions.template;
            if( template ){
                // 判断是否为字符串
                if( typeof template === "string" ){
                    if( template.charAt( 0 ) === "#" ){
                        template = idToTemplate( template );
                    }
                }
            }else if( el ){
                template = getOuterHTML( el );
            }
        }
        return mount.call(this, el, hydrating) 
    }

    Vue.prototype.$mount = function( el,hydrating ){
        el = el && inBrowser ? query(el) : undefined;   
        return mountComponent(this, el, hydrating) 
    }

    function mountComponent(){
        var updateComponent;
        if ("development" !== 'production' && config.performance && mark) {     
            /**/
        } else {
            updateComponent = function () {vm._update(vm._render(), hydrating);};   //渲染成Vnode并转换为真实DOM
        }

        new Watcher(vm, updateComponent, noop, null, true);
    }

    function renderMixin(Vue) { 
        /**/
        Vue.prototype._render = function () {                   //6.把rener渲染成Vnode
        }
    }

    function lifecycleMixin(Vue) {  
        Vue.prototype._update = function (vnode, hydrating) {   //7.更新操作，把Vnode渲染成真实DOM
            /**/
            if (!prevVnode) {                                       //如果prevVnode为空，即初始化时
                vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false, vm.$options._parentElm, vm.$options._refElm);    //执行vm.__patch__方法渲染成真实的DOM节点
                vm.$options._parentElm = vm.$options._refElm = null;
            } else {                                                //如果prevVnode不为空，即更新操作时
                vm.$el = vm.__patch__(prevVnode, vnode);                //调用vm.__patch__进行更新操作
            }
        }
    }



    return Vue
}))