const express = require('express');
const server = express();
const validator = require('validator');
const fetch = require('node-fetch');

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
            res.redirect(301, 'https://localhost/forgot/resetPassword.html');
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
    return fetch('http://gmailservice:8081/reset', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ params: params })
    }).then((res) => res.json());
}
