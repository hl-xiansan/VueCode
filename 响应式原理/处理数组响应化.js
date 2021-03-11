let data = {
    name:'张三',
    age:'19',
    course:[
        {name:'语文'},
        {name:'数学'},
        {name:'英语'},
    ]
};  // 除了递归，还可以使用队列，（ 深度优先 和 广度优先 ）

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
// 继承关系：arr -> Array.prototype -> Object.prototype -> ...
// 继承关系：arr -> 改写方法 -> Array.prototype -> Object.prototype -> ...

let array_methods = Object.create( Array.prototype );

ARRAY_METHOD.forEach( method =>{
    array_methods[ method ] = function(){

        // 调用原来的方法
        console.log( `调用的是拦截的 ${ method } 方法` );

        // 将数组的数据进行响应化
        for( let i=0;i<arguments.length;i++ ){
            reactify( arguments[ i ] );
        }

        let res = Array.prototype[ method ].apply( this,arguments );
        // let res = Array.prototype[ method ].call( this,...arguments ); // 类比
        return res

    }
} )

// 简化后的版本
function defineReactive( target,key,value,enumerable ){

    if(  typeof value === "object" && value !=null && !Array.isArray( value ) ){
        // 是非数组的引用类型 
        reactify( value );
    }

    Object.defineProperty( target,key,{
        configurable:true,
        enumerable:!!enumerable,
        get(){
            console.log(`读取${ key } 的属性`);
            return value
        },
        set( newVal ){
            console.log(`设置${ key } 的属性为 ${ newVal } `);
            value = newVal
        }
    } )
}

//将对象 o 响应化
function reactify( o ){
    let keys = Object.keys( o );

    for( let i = 0;i < keys.length;i++ ){
        let key = keys[ i ]; // 属性名
        let value = o[ key ];

        // 判断这个属性是不是引用类型，判断是不是数组
        // 如果是引用类型就需要递归，如果不是就不用递归
        // 如果不是引用类型，需要使用 defineReactive 将其变成响应式的
        // 如果是引用类型，还是需要使用 defineReactive 将其变成响应式的
        // 如果是数组？就需要循环数组，然后将数组里面的元素进行响应化
        if( Array.isArray( value ) ){   // 判断是不是数组,如果是们就需要循环了，然后递归

            // 数组
            value.__proto__ = array_methods; // 数组就可以响应式了

            for( let j=0;j<value.length;j++ ){
                reactify( value[ j ] );
            }
            
        }else { //不是一个数组
                //但是有可能不是引用类型，我们就需要递归
            defineReactive( o,key,value,true );
        }
    }
}

reactify( data );