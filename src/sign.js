import Request from './common/request'

(async () => {
    try {
        // const res = await Request('/login');
        // console.log(res);

        setTimeout(async () => {
            try{
                const ret = await Request('/info'); 
                console.log(ret)
            } catch(er){
                console.log(er);
            }
        }, 3000);
    } catch (err) {
        console.log(err);
    }
})()



