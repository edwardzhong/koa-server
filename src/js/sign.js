import { get, post } from './common/request'
import '../css/base.css'
import '../scss/sign.scss'

const tip = document.getElementById('tip');
const wrap = document.getElementsByClassName('form-block')[0];
const logForm = document.forms['logForm'];
const regForm = document.forms['regForm'];

logForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const data = new FormData(this);
    // console.log(this, this["email"], e.target.elements["pass"]);
    const btn = this.getElementsByTagName('button')[0];
    btn.disabled = true;

    post('/login', data).then(res => {
        btn.disabled = false;
        console.log(res);
        if (res.code == 0) {
            location.replace('/');
        } else {
            showTip(res.msg);
        }
    }).catch(err => {
        btn.disabled = false;
        console.log(err)
        showTip(err.msg);
    });
}, false);

regForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const pass = this['password'];
    const pass2 = this['pass2'];

    if (pass.value !== pass2.value) {
        pass2.classList.add('invalid');
        showTip('确认密码与原密码不一致');
        return;
    }
    pass2.classList.remove('invalid');
    const data = new FormData(this);
    post('/register', data).then(res => {
        console.log(res);
        if (res.code == 0) {
            location.replace('/');
        } else {
            showTip(res.msg);
        }
    }).catch(err => {
        console.log(err);
        showTip(err.msg);
    });
}, false);

function showTip(msg) {
    tip.innerText = msg;
    if (!tip.classList.contains('animate')) {
        tip.classList.add('animate');
        setTimeout(() => {
            tip.classList.remove('animate');
        }, 2500);
    }
}

let firstLoad = true,
    Actions = {
        log: function () { },
        reg: function () { }
    };

function selectHash(hash) {
    if (location.hash.substr(1) != hash) {
        location.hash = hash;
        return;
    }
    var args = hash.split('/');
    var actionName = args[0];
    if (!actionName || !(actionName in Actions)) {
        selectHash('log');
    } else {
        activePage(actionName);
        Actions[actionName].apply(this, args);
        firstLoad = false;
    }
}

function activePage(name) {
    const change = () => {
        if (name == 'log') {
            logForm.style.display = '';
            regForm.style.display = 'none';
        } else {
            logForm.style.display = 'none';
            regForm.style.display = '';
        }
    };
    if (!firstLoad) {
        wrap.classList.add('animate');
        setTimeout(change, 800);
    } else {
        change();
    }
    setTimeout(() => {
        wrap.classList.remove('animate');
    }, 1000);
}

window.onhashchange = function (e) {
    selectHash(location.hash.replace('#', ''));
};

selectHash(location.hash.substr(1));

