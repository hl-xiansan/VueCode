function createGetValueByPath( path ){
    let paths = path.split('.'); // [xxx,yyy,zzz]

    return function getValueByPath( obj ){
        let res = obj;
        let prop;
        while( prop = paths.shift() ){
            res = res[ prop ];
        }
        return res
    }
}

let getValueByPath = createGetValueByPath( 'a.b.c.d' );

let o = {
    a:{
        b:{
            c:{
                d:{
                    e:'正确了'
                }
            }
        }
    }
}

var res = getValueByPath( o );