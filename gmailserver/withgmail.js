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

const crypto = require('crypto');

const algorithm = 'aes-128-cbc';
const key = '123456789123456789123456789';

function encrypt(text) {
    var mykey = crypto.createCipher(algorithm, key);
    var mystr = mykey.update(text, 'utf8', 'hex');
    mystr += mykey.final('hex');
    return mystr;
}
function decrypt(text) {
    var mykey = crypto.createDecipher(algorithm, key);
    var mystr = mykey.update(text, 'hex', 'utf8');
    mystr += mykey.final('utf8');
    return mystr;
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

function encode(text) {
    let bufferObj = Buffer.from(text, 'utf8');
    let encodedString = bufferObj.toString('base64');
    return encodedString;
}
function decode(text) {
    let bufferObj = Buffer.from(text, 'base64');
    let decodedString = bufferObj.toString('utf8');
    return decodedString;
}

server.post('/forgotPass', urlencodedParser, function (req, res) {
    endEmail = req.body.email;
    encodedEmail = encode(endEmail);
    mailTransporter = createMailTransporter(mailService, serverEmail, serverEmailPass);
    let date = new Date();
    let dateString = date.getTime();
    let urlParams = encodedEmail + '?' + dateString;
    //encrypt
    //var encrypted = urlCrypt.cryptObj(urlParams);
    var encrypted = encrypt(urlParams);
    console.log(encrypted);
    mailDetails = createMailDetails(
        serverEmail,
        endEmail,
        'http://localhost:8081/reset?' + encrypted
    );
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
    console.log(url);
    let encrypted = url.split('?');
    let decrypted = decrypt(encrypted[1]);
    console.log(decrypted);
    let splitedDecrypted = decrypted.split('?');
    let email = splitedDecrypted[0];
    encryptedEmail = encrypt(email);

    if (isExpired(splitedDecrypted, 1, 30)) {
        res.cookie('mailtoken', encryptedEmail, {
            maxAge: 900000
        });
        res.sendFile(__dirname + '/html/resetPassword.html');
    } else {
        console.log('false');
        res.sendStatus(404);
    }
});
server.post('/resetPassword_form', urlencodedParser, function (req, res) {
    const encryptedMail = req.cookies.mailtoken;
    let decryptedMail = decrypt(encryptedMail);

    let password = req.body.password;
    let confirmpassword = req.body.confirmPassword;

    // sammenligning skal gøres på frontend og ikke her.
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
