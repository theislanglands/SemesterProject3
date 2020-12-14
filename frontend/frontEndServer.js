const express = require('express');
const server = express();
const validator = require('validator');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env' });

server.get('/forgot/forgotPass.js', (req, res) => {
    res.sendFile(__dirname + '/html/forgot/forgotPass.js');
});
server.get('/forgot/forgotPassword-page.html', (req, res) => {
    res.sendFile(__dirname + '/html/forgot/forgotPassword-page.html');
});
server.get('/forgot/resetPassFront.js', (req, res) => {
    res.sendFile(__dirname + '/html/forgot/resetPassFront.js');
});
server.get('/forgot/resetPassword.html', (req, res) => {
    res.sendFile(__dirname + '/html/forgot/resetPassword.html');
});
server.get('/login/login-page.html', (req, res) => {
    res.sendFile(__dirname + '/html/login/login-page.html');
});
server.get('/', (req, res) => {
    res.sendFile(__dirname + '/html/index.html');
});
server.get('/reset', async (req, res) => {
    let url = req.url;
    url = validator.escape(url);
    let params = url.split('?')[1];
    console.log(params);
    if (params != undefined) {
        let response = await isValidURL(params);
        if (response.valid) {
            res.cookie(response.cookie.name, response.cookie.value, {
                maxAge: response.cookie.maxAge
            });
            // eslint-disable-next-line no-undef
            res.redirect(301, process.env.RESET_HTML);
        } else {
            res.send('not authorized');
        }
    }
});
server.listen(8090, () => {
    console.log('frontend listening on 8090');
});

/**
 *
 * @param {*} params
 */
async function isValidURL(params) {
    return fetch(process.env.POST_RESET_MAILSERVICE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ params: params })
    }).then((res) => res.json());
}
