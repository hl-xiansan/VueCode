function CreateGetValeByPath( obj,path ){
    let paths = path.split('.'); // [xxx,yyy,zzz]
    let res = obj;
    let prop = null;
    while( prop = paths.shift() ){
        res = res[ prop ];
    }
    return res
  }
let o = {
    a:{
        b:{
            c:'aaa'
        }
    }
}
let res = CreateGetValeByPath( o,'o.a.b' );
console.log(res);