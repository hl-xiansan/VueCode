var o = {
    nane:'张三',
    age:28,
    gender:'男'
};

let keys = Object.keys( o );
for( let i=0;i<keys.length;i++ ){
    defineReactive( o,keys[ i ],o[ keys[ i ] ],true );
}

/** 封装 Object.defineProperty() 方法 
 * 
 * @param {object} target 
 * @param {string} key 
 * @param {string} value 
 * @param {boolean} enumerable 
 */
function defineReactive( target,key,value,enumerable ){
    Object.defineProperty( target,key,{
        configurable:true,
        enumerable:!!enumerable,
        get(){
            console.log(`读取 o.${ key } 的值 ${ value }`);
            return value;
        },
        set( newVal ){
            console.log(`设置o.${ key }的值为${ newVal }`);
            value = newVal;
        }
    } )
}