var o = {
    name:'张三',
    age:28,
    gender:'男',
    course:[
        { name:'数学',price:{
            number:34
        } },
        { name:'语文',price:{
            number:34
        } },
        { name:'英语',price:{
            number:34
        } },
        { name:'化学',price:{
            number:34
        } },
    ],
    a:{
        b:{
            c:'层级'
        }
    }
};

reactify( o );

function reactify( o ){
    let keys = o ?  Object.keys( o ):0; 
    for( let i=0;i<keys.length;i++ ){
        let key = keys[ i ];
        let value = o[ key ];
        if( Array.isArray( value ) || typeof value === "object" ){
            let Kes = Object.keys( value );
            for( let j=0;j<Kes.length;j++ ){
                reactify( value[ Kes ] );
            }
        } else{
            defineReactive( o,key,value,true )
        }
    }
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