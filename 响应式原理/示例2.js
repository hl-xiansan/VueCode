var o = {
    name:"张三",
    age:'19',
    gender:'男'
}

// 简化后的版本
function defineReactive( target,key,value,enumerable ){
    Object.defineProperty( target,key,{
        configurable:true,
        enumerable:!!enumerable,
        get(){
            console.log(`读取o的 ${ key } 的属性`);
            return value
        },
        set( newVal ){
            console.log(`设置o的 ${ key } 的属性为 ${ newVal } `);
            value = newVal
        }
    } )
}

// 将对象转换为响应式的
let keys = Object.key( o );
for( let i=0;i< keys.length;i++ ){
    defineReactive( o,keys[ i ],o [ keys[ i ] ],true );
}