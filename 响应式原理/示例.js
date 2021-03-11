var o = {};

// 给 o 提供属性
o.name = "张三";

// 等价于
Object.defineProperty( o,'age',{
    configurable:true,  // 可配置
    writable:true,      // 可赋值
    enumerable:true,    // true可枚举 / false 不可枚举 （ 但是可以获取，也可以修改值 ）
    value:19
} )

// 重点在于 get 和 set
// 在响应式表示再赋值和读取的时候，附带要做一些事情

// 示例
let _gender;
Object.defineProperty( o,"gender",{
    configurable:true,
    enumerable:true,
    get(){  // 如果使用 o.gender 来访问数据的时候，就会调用 get 方法 ( getter,读取器 )
        return _gender
    },
    set( newVal ){ // 如果 o.gender = 'xxx'，就会调用这个 set 方法,并设置的值会以参数传入 set
        // console.log( '赋值的新值为'+newVal );
        _gender = newVal;
    },
} )
// 注意：如果同时使用了 set 和 get ，需要一个中间变量来存取真正的值

// 问题：这个 gender 被暴露在全局作用域下了？？？ 如何解决

// 在 Vue 中 使用 defineReactive( target,key,value,enumerable );
