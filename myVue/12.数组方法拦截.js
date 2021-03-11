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

let arr = [];

let array_methods = Object.create( Array.prototype );

ARRAY_METHOD.forEach( method => {
    array_methods[ method ] = function(){
        console.log(`调用的是拦截的 ${ method } 方法`);
        let res = Array.prototype[ method ].apply( this,arguments );
        return res
    }
} )
arr.__proto__ = array_methods;