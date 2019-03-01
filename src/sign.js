import { get, post } from './common/request'
import '../public/css/base.css'
import '../public/scss/sign.scss'

const loginForm = document.forms['loginForm'];
// loginForm['email'].oninvalid=function(e){
//     if(this.validity.valueMissing){
//         this.setCustomValidity('邮箱不能为空');
//     }
//     if(this.validity.typeMismatch){
//         this.setCustomValidity('请正确的输入邮箱地址');
//     }
// };
// loginForm['pass'].oninvalid=function(e){
//     if(this.validity.valueMissing){
//         this.setCustomValidity('密码不能为空');
//     }
//     if(this.validity.patternMismatch){
//         this.setCustomValidity('请使用4-12位字母或数字');
//     }
// };

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const data = new FormData(this);
    // console.log(this, this["email"], e.target.elements["pass"]);
    // const btn = this.getElementsByTagName('button')[0];
    // btn.disabled = true;

    post('/login', data).then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err)
    });
}, false);

document.forms['regForm'].addEventListener('submit', function (e) {
    e.preventDefault();
    const pass = this['password'];
    const pass2 = this['pass2'];
    if (pass.value !== pass2.value) {
        pass2.classList.add('invalid');
        return;
    }
    pass2.classList.remove('invalid');
    const data = new FormData(this);
    post('/register', data).then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    });
}, false);
// (async () => {
//     try {
//         // const res = await Request('/login');
//         // console.log(res);

//         setTimeout(async () => {
//             try{
//                 const ret = await Request('/info'); 
//                 console.log(ret)
//             } catch(er){
//                 console.log(er);
//             }
//         }, 3000);
//     } catch (err) {
//         console.log(err);
//     }
// })()



