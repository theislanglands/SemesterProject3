var serverEmail = 'cstgruppe10@gmail.com';
var serverEmailPass = 'P3J2z3YLwDHe';
var mailService = 'gmail';
var mailTransporter;
var mailDetails;
var endEmail;
var emailUrl;

const nodemailer = require('nodemailer');
const cookieparser = require('cookie-parser');
const fetch = require('node-fetch');

require('dotenv').config({ path: '.env' });
var urlCrypt = require('url-crypt')(process.env.URL_SECRET);

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
        subject: 'Test mail',
        // HTML body
        html:
            `<p><b>Hello</b> to myself </p>
        <p>Here's a nyan cat for you as an embedded attachment: ` + hyperlink
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

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyparser.urlencoded({
    extended: false
});

server.use(express.static('html'));
server.use(cookieparser());

server.post('/forgotPass', urlencodedParser, function (req, res) {
    endEmail = req.body.email;
    mailTransporter = createMailTransporter(mailService, serverEmail, serverEmailPass);
    let date = new Date();
    let dateString = date.getTime();
    let urlParams = endEmail + '?' + dateString;
    //encrypt
    var hash = urlCrypt.cryptObj(urlParams);
    console.log(hash);
    mailDetails = createMailDetails(serverEmail, endEmail, 'http://localhost:80/reset?' + hash);
    let bool = sendMail(mailTransporter, mailDetails);
    if (bool) {
        urlencodedParser;
        res.sendStatus(200);
    } else {
        //res.sendStatus(406);
    }
});

server.get('/reset', urlencodedParser, function (req, res) {
    let url = req.url;
    let encoded = url.split('?');
    let decoded = decodeUrl(url, '?');
    let splitedDecoded = decoded.split('?');
    emailUrl = splitedDecoded[0];
    if (isExpired(splitedDecoded, 1, 1)) {
        res.cookie('mailtoken', emailUrl);
        res.sendFile(__dirname + '/html/resetPassword.html');
    } else {
        console.log('false');
        res.sendStatus(404);
    }
});
server.post('/resetPassword_form', urlencodedParser, function (req, res) {
    const mail = req.cookies.mailtoken;
    let password = req.body.password;
    let confirmpassword = req.body.confirmPassword;
    if (password === confirmpassword) {
        console.log('Password: ' + password + ' Email: ' + mail);
        // the password and the mail will be passed with fetch to the database API
        //
        //
        // fetch('http://localhost:80/users/changePassword', {
        //     method: 'post',
        //     headers: {
        //         'Content-Type' : 'application/json'
        //     },
        //     body: JSON.stringify({mail:mail, newPassword:password})
        // })
        // .then(function(res){ console.log(res) })
        // .catch(function(res){ console.log(res) })
    }
});

var server1 = server.listen(8081, function () {
    var host = server1.address().address;
    var port = server1.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

function decodeUrl(url, split) {
    let splitedUrl = url.split(split);
    let a = splitedUrl[1];
    let decoded = urlCrypt.decryptObj(a);
    return decoded;
}

function isExpired(splitedDecodedArr, indexOfTime, valideInMinutes) {
    let timeCreated = parseInt(splitedDecodedArr[indexOfTime]);
    var timeExpired = timeCreated + valideInMinutes * 60 * 1000;
    console.log(timeExpired);
    let now = new Date();
    now = now.getTime();
    console.log(now);
    if (timeExpired > now) {
        return true;
    } else {
        return false;
    }
}
