
exports.index = async ctx =>{
    ctx.render('index.html');
};

exports.msg = async ctx=> {
    const token = ctx.state.token;
    if (!token.isValid) {
        ctx.status = 403;
        ctx.body = token;
    } else {
        ctx.body = ctx.state.token;
    }
};
