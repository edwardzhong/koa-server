import { get, post } from './common/request'
import '../public/css/base.css'
import '../public/scss/sign.scss'

document.forms['loginForm'].addEventListener('submit', function (e) {
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



