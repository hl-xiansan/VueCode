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
let arr = [];
// 继承关系：arr -> Array.prototype -> Object.prototype -> ...
// 继承关系：arr -> 改写方法 -> Array.prototype -> Object.prototype -> ...

let array_methods = Object.create( Array.prototype );

ARRAY_METHOD.forEach( method =>{
    array_methods[ method ] = function(){

        // 调用原来的方法
        console.log( `调用的是拦截的 ${ method } 方法` );

        let res = Array.prototype[ method ].apply( this,arguments );
        // let res = Array.prototype[ method ].call( this,...arguments ); // 类比
        return res

    }
} )

arr.__proto__ = array_methods;

// __proto__有兼容问题，Vue是如何处理的？？？
// Vue 源码做了判断
// 如果浏览器自持 __proto__,那么他就怎么做
// 如果不支持，Vue 使用的时混入法

// arr.length = 0 在Vue2中无法解决，但是在Vue3中使用proxy解决了该缺陷
// Vue2中，可以使用 arr.splice( 0 ) 这个方法特换 arr.length = 0;