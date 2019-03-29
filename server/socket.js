
const getTime = () => {
    let date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

const getColor = () => 'hsl(' + Math.floor(Math.random() * 360) + ',90%, 40%)';

module.exports = io => {
    io.on('connection', socket => {
        socket.emit('open');//通知客户端已连接

        // 构造客户端对象
        let client = {
            sid: socket.id,
            name: null,
            color: getColor()
        };

        socket.on('sign', (user, callback) => {
            client.user = user;
            let data = {
                sid: socket.sid,
                id: user.id,
                name: user.name,
                text: '=== welcome, ' + user.name + ' ===',
                author: 'System',
                time: getTime(),
                color: client.color
            };

            callback(data);
            //广播给其他用户有新用户加入
            socket.broadcast.emit('userin', data);
        });

        // 对message事件的监听
        socket.on('message', msg => {
            let data = {
                sid: socket.id,
                id: client.user.id,
                name: client.user.name,
                text: msg,
                author: client.user.name,
                time: getTime(),
                color: client.color
            };
            console.log(client.user.name + ' say: ' + msg);

            // 给自己发消息
            socket.emit('reply', data);
            // 广播给其他用户发消息
            socket.broadcast.emit('reply', data);
        });

        //监听出退事件
        socket.on('disconnect', function () {
            console.log(client);
            if(!client.user) return;
            let data = {
                sid:socket.id,
                id: client.user.id,
                name: client.user.name,
                text: '=== goodbye, ' + client.user.name + ' ===',
                author: 'System',
                time: getTime(),
                color: client.color
            };
            // 广播用户已退出
            socket.broadcast.emit('userout', data);
        });
    });
};
