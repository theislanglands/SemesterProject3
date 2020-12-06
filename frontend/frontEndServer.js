const express = require('express');
const server = express();
const validator = require('validator');
const fetch = require('node-fetch');

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
server.get('/reset', async (req, res) => {
    let url = req.url;
    url = validator.escape(url);
    let params = url.split('?')[1];
    console.log(params);
    if (params != undefined) {
        let bool = await isValidURL(params);
        if (bool) {
            //res.sendFile(__dirname + '/html/forgot/resetPassword.html');
        } else {
            res.send('not authorized');
        }
    }
});
server.get('/resetPassFront.js', (req, res) => {
    res.sendFile(__dirname + '/html/forgot/resetPassFront.js');
});
server.listen(8090, () => {
    console.log('frontend listening on 8090');
});

async function isValidURL(params) {
    return fetch('http://gmailservice:8081/reset', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ params: params })
    }).then((res) => res.text());
}
