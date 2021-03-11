function Vue( opction ){
    this.el = opction.el
    this._data = opction.data;
}

let app = new Vue({
    el:'#root',
    data:{
        name:'1',
        msg:'2'
    }
})
console.log(app);