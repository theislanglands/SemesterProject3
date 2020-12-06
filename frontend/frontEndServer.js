const express = require('express');
const server = express();
const validator = require('validator');

server.get('/', (req, res) => {
    res.sendFile(__dirname + '/html/index.html');
});
server.get('/login', (req, res) => {
    res.sendFile(__dirname + '/html/login/login-page.html');
});
server.get('/forgotPass', (req, res) => {
    res.sendFile(__dirname + '/html/forgot/forgotPasword-page.html');
});
server.get('/forgotPass.js', (req, res) => {
    res.sendFile(__dirname + '/html/forgot/forgotPass.js');
});
server.get('/reset', (req, res) => {
    res.sendFile(__dirname + '/html/forgot/resetPassword.html');
});
server.get('/resetPassFront.js', (req, res) => {
    res.sendFile(__dirname + 'html/forgot/resetPassFront.js');
});
server.listen(8090, () => {
    console.log('frontend listening on 8090');
});
