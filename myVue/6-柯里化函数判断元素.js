// 柯里化函数判断元素，优化性能

let tag = "div,li,p,ul".split( "," );

// 如果有 **6** 种内置标签，而模板中有 **10** 个标签需要判断，那么就需要执行 **60** 次循环，这样的话，循环就成指数被增长，就非常消耗性能
// function isHtmlTag( tagName ){
//     tagName = tagName.toLowerCase();
//     if(tag.indexOf( tagName ) > -1)  return true;
//     return false
// }

function makeMap( keys ){
    let set = {};
    keys.forEach( key=>{ set[ key ] = true } );
    return function ( tagName ){
        return !! set[ tagName.toLowerCase() ];
    }
}

let isHtmlTag = makeMap( tag );
console.log( isHtmlTag( 'a' ) );