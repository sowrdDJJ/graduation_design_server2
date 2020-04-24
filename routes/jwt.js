const expressJwt = require('express-jwt')
const { PRIVATE_KEY } = require('../utils/constant')

const jwtAuth = expressJwt({
    secret: PRIVATE_KEY,
    credentialsRequired: true
}).unless({
    //whiteList
    path:['/api/getUserInformation', '/api/postUserInformation', '/api/home', '/api/getSeach', '/api/getCommodity', '/drt']
});

module.exports = jwtAuth;