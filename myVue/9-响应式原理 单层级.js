var o = {
    gender:'男'
};
o.name = "张三";
// 等价于
Object.defineProperty( o,'age',{
    configurable:true,
    writable:true,
    enumerable:true,
    value:'12'
} )

/** 
 * 重点在于 get 和 set
 * 在响应式的时候，赋值和取值，附带一些操作
 */
let name = o.name;
 Object.defineProperty( o,"name",{
     configurable:true,
     enumerable:true,
     get(){  // 如果使用 o.name 来访问数据的时候，就会调用 get 方法 ( getter,读取器 )
         return name
     },
     set( newVal ){ // 如果 o.name = 'xxx'，就会调用这个 set 方法,并设置的值会以参数传入 set
         console.log( '赋值的新值为'+newVal );
         name = newVal;
     },
 } )