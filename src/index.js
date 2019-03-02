import io from 'socket.io-client';
import { get, post } from './common/request'
import '../public/css/base.css'
import '../public/scss/index.scss'

const input = document.getElementById('input');
const content = document.getElementById('content');
const nav = document.getElementById('nav');
const tip = document.getElementById('tip');
let user= {};

//建立websocket连接
const socket = io('http://127.0.0.1:3001');
//收到server的连接确认
socket.on('open', function () {
    showTip('socket io is open !');
    init();
});

const init = async () => {
    try {
        const ret = await get('/userInfo');
        if (ret.code == 2) {
            location.href = '/sign.html';
            return;
        }
        if (ret.code != 0) {
            alert(ret.msg);
            return;
        }
        user = ret.data;
        socket.send({ type: 'sign', data: user });
    } catch (err) {
        alert(err.msg || err.message);
    }
}


//监听system事件，判断welcome或者disconnect，打印系统消息信息
socket.on('system', function (data) {
    console.log(data);
    appendMsg(data);
    if (data.type == 'welcome') {
        appendUser(data);
        if(data.id === user.id){
            showTip('connect to server is ok, have fun !');
            setTimeout(hideTip, 1000);
        }
    } else if(data.type == 'disconnect'){
        removeUser(data);
    }
});

//监听message事件，打印消息信息
socket.on('message', function (data) {
    console.log(data);
    appendMsg(data);
});

//通过“回车”提交聊天信息
input.onkeydown = function (e) {
    let msg = this.value.trim();
    if (e.keyCode === 13) {
        if (!msg) return;
        socket.send({ type: 'message', data: msg });
        this.value = '';
    }
};

function appendMsg(data) {
    let p = document.createElement('p');
    let author = data.author == 'System' ? '' : (data.author + ':')
    p.innerHTML = `<time>${data.time}</time><span style="color:${data.color}">${author}</span><span>${data.text}</span>`;
    content.appendChild(p);
    content.scrollTop = content.scrollHeight;
}

function appendUser(data){
    let a = document.createElement('a');
    a.href='javascript:;'
    a.setAttribute('data-id',data.id);
    a.innerText=data.name;
    nav.appendChild(a);
}

function removeUser(data){
    Array.from(nav.children).forEach(a=>{
        if(a.dataset.id == data.id){
            nav.removeChild(a);
        }
    });
}

const showTip = msg => {
    tip.innerText = msg;
    tip.classList.add('show');
}
const hideTip = () => {
    tip.classList.remove('show');
}