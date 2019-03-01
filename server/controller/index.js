
exports.index = async function(ctx) {
    ctx.render('index.html');
};

exports.msg = async function(ctx) {
    ctx.body={a:111};
    // const token = ctx.state.token;
    // if (!token.isValid) {
    //     ctx.status = 403;
    //     ctx.body = token;
    // } else {
    //     ctx.body = ctx.state.token;
    // }
};
