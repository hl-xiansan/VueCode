function axios(){
    return{
        get:()=>{
            console.log('get');
        }
    }
}
let Ajax = axios;
Ajax( 'get' );