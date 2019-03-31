/**
 * app config
 */
module.exports = {
    isDev: process.env.NODE_ENV == 'development',
    port: 3000,
    socketPort: 3001,
    clientPort: 3002,
    secret: 'JEFFJWT',
    exp: 60 * 60,
};

