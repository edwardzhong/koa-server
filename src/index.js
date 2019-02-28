import io from 'socket.io-client';
import '../public/css/base.css'
import '../public/scss/index.scss'

const input = document.getElementById('input');
const content = document.getElementById('content');
const info = document.getElementById('info');

//建立websocket连接
const socket = io('http://127.0.0.1:3001');

//收到server的连接确认
socket.on('open', function () {
    info.innerText = 'choose a name:';
});

//监听system事件，判断welcome或者disconnect，打印系统消息信息
socket.on('system', function (data) {
    console.log(data);
    appendMsg(data);
    if (data.type == 'welcome') {
        info.innerText = 'send message';
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
        socket.send(msg);
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
