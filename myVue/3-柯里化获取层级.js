/** 柯里化函数获取层级对象
 * @param {String} path     传入的路径
 * @returns                 返回一个函数
 */
function CreateGetValueByPath( path ){
    let paths = path.split( '.' );
    return function getValueByPath( obj ){
        let res = obj;
        let prop;
        while( prop = paths.shift() ){
            res = res[ prop ]
        };
        return res;
    }
};

let getValueByPath = CreateGetValueByPath( 'a.b.c.d' );

let data = {
    a:{
        b:{
            c:{
                d:{
                    e:{
                        f:'找到了'
                    }
                }
            }
        }
    }
}
let res = getValueByPath( data );
console.log(res);