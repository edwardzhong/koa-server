import { userInfo } from './controller/user'
import { login, register } from './controller/sign'
import { uploadFile } from './controller/file'
import Router from 'koa-router';

const addRouters = (router: Router) => {
    router
        .get('/userinfo', userInfo)
        .post('/login', login)
        .post('/register', register)
        .post('/upload', uploadFile)
};

export default addRouters