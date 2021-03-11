# 关于Vue
> vue是一个兴起的前端js库，是一个精简的MVVM。MVVM模式是由经典的软件架构MVC衍生来的，当View(视图层)变化时，会自动更新到ViewModel(视图模型)，反之亦然，View和ViewModel之间通过双向绑定(data-binding)建立联系。
# 代码结构
> vue.js源码就是一个立即执行匿名函数表达式,内部定义了一个vue函数对象，组后返回挂载到window的vue属性上

先复习一下立即执行匿名函数表达式，如下:
```js
// 立即执行的匿名函数
(function(){

})()

(function(global,msg){　　　　　　
    global.alert(msg)　　　　//运行时会弹出一个窗口，内容为:Hello World
})(this,'Hello World')
```
## Vue 内部样式
```js
(function (global, factory) {   　　　　　　//在浏览器环境下global等于全局window
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global.Vue = factory()); //执行factory()函数，将返回值Vue传递给window.Vue
}(this, (function () {　　　　　　　

    function Vue(options) {           　　　　//内部定义的Vue函数                 　　　　　　
        if ("development" !== 'production' && !(this instanceof Vue)) {
            warn('Vue is a constructor and should be called with the `new` keyword');
        }
        this._init(options);                          
    }
    return Vue; 　　　　　　　　　　　　　　　　//返回Vue这个函数对象
})));
```