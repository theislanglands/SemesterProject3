//Mail variables
const serverEmail = 'cstgruppe10@gmail.com';
const serverEmailPass = 'P3J2z3YLwDHe';
const mailService = 'gmail';
var mailTransporter;
var mailDetails;
var endEmail;
var emailUrl;
var mailTitle = 'Reset your password';
var mailHtml = `<p><b>Hello</b></p>
        <p>Here's a link, where you can reset your password: `;

var hyperlinkInEmail = 'https://localhost/gmail/reset';

var mailTitleNoti = 'Your password has been changed';
var mailHtmlNoti = `<p><b>Hello</b></p>
        <p>Your email has been changed. If you did not now about this change we strongly advise you to change your password immediately!</p>`;
const nodemailer = require('nodemailer');
const cookieparser = require('cookie-parser');
const fetch = require('node-fetch');
const validator = require('validator');

require('dotenv').config({ path: '.env' });

const crypto = require('crypto');
const secret = 'ælaksndfkajsndflkabsdflhb';

const algorithm = 'aes-128-cbc';

const iv = crypto.randomBytes(16);
const salt = 'foobar';
const hash = crypto.createHash('sha1');

hash.update(salt);

let key = hash.digest().slice(0, 16);

function encrypt(text) {
    if (typeof text == 'string') {
        var cipher = crypto.createCipheriv(algorithm, key, iv);
        var encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    } else {
        console.log("The parameter wasn't a string, try agian");
    }
}
function decrypt(text) {
    if (typeof text == 'string') {
        var decipher = crypto.createDecipheriv(algorithm, key, iv);
        var decrypted = decipher.update(text, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } else {
        console.log("The parameter wasn't a string, try agian");
    }
}

// Expectations
// expect(backAgain).to.eql(data);

function createMailTransporter(mailService, email, pass) {
    let mailTransporter;
    mailTransporter = nodemailer.createTransport({
        service: mailService,
        auth: {
            user: email,
            pass: pass
        }
    });
    return mailTransporter;
}

function createMailDetails(serverEmail, endEmail, link) {
    let details = {};
    let hyperlink = '<a href="' + link + '">resetLink</a></p>';
    return (details = {
        from: serverEmail,
        to: endEmail,
        subject: mailTitle,
        // HTML body
        html: mailHtml + hyperlink
    });
}

function sendMail(mailTransporter, mailDetails) {
    mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
            console.log('Error Occurs');
        } else {
            console.log('Email sent successfully');
        }
        if (data.messageTime != 0) {
        }
    });
    return true;
}

//create a server object:
const express = require('express');
const server = express();
const bodyparser = require('body-parser');
const https = require('https');
const { stringify } = require('querystring');
const { resolve } = require('path');

// Create application/x-www-form-urlencoded parser
//LÆS OP PÅ DETTE
var urlencodedParser = bodyparser.urlencoded({
    extended: false
});

server.use(express.static('html'));
server.use(cookieparser());

function encode(text) {
    if (typeof text == 'string') {
        let bufferObj = Buffer.from(text, 'utf8');
        let encodedString = bufferObj.toString('base64');
        return encodedString;
    } else {
        console.log("The parameter wasn't a string, try agian");
    }
}
function decode(text) {
    if (typeof text == 'string') {
        let bufferObj = Buffer.from(text, 'base64');
        let decodedString = bufferObj.toString('utf8');
        return decodedString;
    } else {
        console.log("The parameter wasn't a string, try agian");
    }
}

server.post('/forgotPass', urlencodedParser, async function (req, res) {
    let endEmail = validator.escape(req.body.email);
    if (validator.isEmail(endEmail)) {
        var bool = await isValidUser(endEmail);
        console.log(bool);
        if (bool === 'true') {
            mailTransporter = createMailTransporter(mailService, serverEmail, serverEmailPass);
            let date = new Date();
            let dateString = date.getTime().toString();
            let urlParams = encode(endEmail + '?' + dateString);
            if (urlParams === undefined) {
                console.log('Encoding failiure');
                res.sendStatus(500);
                return;
            }
            var encrypted = encrypt(urlParams);
            if (encrypted === undefined) {
                console.log('Encrypting failiure');
                res.sendStatus(500);
                return;
            }
            mailDetails = createMailDetails(
                serverEmail,
                endEmail,
                hyperlinkInEmail + '?' + encrypted
            );
            let bool = sendMail(mailTransporter, mailDetails);
            if (bool) {
                res.send(JSON.stringify({ msg: 'An email has been sent to you', isSent: true }));
            } else {
                res.send(
                    JSON.stringify({
                        msg: 'An error ocuured in the server, the email wasnt able to be sent',
                        isSent: false
                    })
                );
            }
        } else {
            res.send(JSON.stringify({ msg: 'No users have this email', isSent: false }));
            return;
        }
    } else {
        res.send(JSON.stringify({ msg: 'not a real Email', isSent: false }));
    }
});

server.get('/reset', urlencodedParser, function (req, res) {
    let url = req.url;
    let encryptedString = url.split('?')[1];
    if (encryptedString !== undefined) {
        let clear = decode(decrypt(encryptedString));
        let email;
        let splitedClear;
        if (clear !== undefined) {
            splitedClear = clear.split('?');
            email = validator.escape(splitedClear[0]);
        } else {
            res.sendStatus(406);
            return;
        }
        //kald database om email eksisterer
        encryptedEmail = encrypt(encode(email));
        if (encryptedEmail !== undefined) {
            if (isExpired(splitedClear, 1, 1)) {
                res.cookie('mailtoken', encryptedEmail, {
                    maxAge: 900000
                });
                res.sendFile(__dirname + '/html/resetPassword.html');
                console.log('A user has used the link, sent in the email');
            } else {
                console.log('The link was expired');
                res.sendStatus(404);
                return;
            }
        } else {
            console.log('An encryption error occured');
            res.sendStatus(404);
            return;
        }
    } else {
        console.log('there was no parameters in the get request to /reset');
        res.sendStatus(404);
        return;
    }
});
server.post('/resetPassword_form', urlencodedParser, async function (req, res) {
    const encryptedMail = req.cookies.mailtoken;
    if (encryptedMail === undefined) {
        res.sendStatus(406);
        return;
    }

    let decodedMail = decode(decrypt(encryptedMail));
    decodedMail = validator.escape(decodedMail);
    if (decodedMail === undefined) {
        console.log('an error ocurred on decryption');
        res.sendStatus(500);
        return;
    }
    //mailen er stadig encoded
    //se om mail eksisterer i database.
    let password = req.body.password;
    if (password === undefined) {
        console.log('server didnt receive the password');
        res.sendStatus(406);
        return;
    }

    // sammenligning skal gøres på frontend og ikke her.

    var sucess = await postNewPassword(decodedMail, password);
    if (sucess) {
        sendNotifificationMail(decodedMail);
        res.send(JSON.stringify({ msg: 'the users password has been reset', success: true }));
    } else {
        res.send(JSON.stringify({ msg: 'an user has ocured', success: false }));
    }
});

var server1 = server.listen(8081, function () {
    var host = server1.address().address;
    var port = server1.address().port;

    console.log('EmailService listening at http://%s:%s', host, port);
});

function isExpired(splitedDecryptedArr, indexOfTime, valideInMinutes) {
    decoded = splitedDecryptedArr;
    let timeCreated = parseInt(decoded[indexOfTime]);
    var timeExpired = timeCreated + valideInMinutes * 60 * 1000;
    let now = new Date();
    now = now.getTime();
    if (timeExpired > now) {
        return true;
    } else {
        return false;
    }
}
function isValidUser(email) {
    return fetch('http://usersservice:9090/isEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' //,
            //Accept: 'text/plain'
        },
        body: 'email=' + encodeURIComponent(email)
    }).then((res) => res.text());
}

function postNewPassword(email, password) {
    // the password and the mail will be passed with fetch to the database API

    return fetch('http://usersservice:9090/changePassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/plain'
        },
        body: 'email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password)
    })
        .then((res) => res.text())
        .catch((err) => console.log(err));
}

function sendNotifificationMail(endEmail) {
    let mailTransporter = createMailTransporter(mailService, serverEmail, serverEmailPass);
    let details = {};
    details = {
        from: serverEmail,
        to: endEmail,
        subject: mailTitleNoti,
        // HTML body
        html: mailHtmlNoti
    };
    sendMail(mailTransporter, details);
}
