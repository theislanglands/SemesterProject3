//Mail variables
var serverEmail = 'cstgruppe10@gmail.com';
var serverEmailPass = 'P3J2z3YLwDHe';
var mailService = 'gmail';
var mailTransporter;
var mailDetails;
var endEmail;
var emailUrl;
var mailTitle = 'Test mail';
var mailHtml = `<p><b>Hello</b></p>
        <p>Here's a link, where you can reset your password: `;

var hyperlinkInEmail = 'https://localhost/gmail/reset';

const nodemailer = require('nodemailer');
const cookieparser = require('cookie-parser');
const fetch = require('node-fetch');
const validator = require('validator');

require('dotenv').config({ path: '.env' });

const crypto = require('crypto');

const key = '123456789123456789123456789';

const algorithm = 'aes-128-cbc';

function encrypt(text) {
    //Undersg iv, fordi denne funtion er outdated
    var cipher = crypto.createCipher(algorithm, key);
    var encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    //console.log(typeof encrypted);
    return encrypted;
}
function decrypt(text) {
    //Undersg iv, fordi denne funtion er outdated
    console.log(typeof text);
    var decipher = crypto.createDecipher(algorithm, key);
    var decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    //console.log(typeof decrypted);
    return decrypted;
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

// Create application/x-www-form-urlencoded parser
//LÆS OP PÅ DETTE
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
    let endEmail = validator.escape(req.body.email);
    if (validator.isEmail(endEmail)) {
        mailTransporter = createMailTransporter(mailService, serverEmail, serverEmailPass);
        let date = new Date();
        let dateString = date.getTime().toString();
        console.log('DateString: ' + dateString);
        let urlParams = encode(endEmail + '?' + dateString);
        var encrypted = encrypt(urlParams);
        mailDetails = createMailDetails(serverEmail, endEmail, hyperlinkInEmail + '?' + encrypted);
        let bool = sendMail(mailTransporter, mailDetails);
        if (bool) {
            res.send(JSON.stringify({ msg: 'An email has been sent to you', isSent: true }));
        } else {
            //res.sendStatus(406);
        }
    } else {
        res.send(JSON.stringify({ msg: 'not a real Email', isSent: false }));
    }
});

server.get('/reset', urlencodedParser, function (req, res) {
    let url = req.url;
    let encryptedString = url.split('?')[1];
    let clear = decode(decrypt(encryptedString));

    let splitedClear = clear.split('?');
    console.log(splitedClear);
    let email = splitedClear[0];
    //kald database om email eksisterer

    encryptedEmail = encrypt(encode(email));
    if (isExpired(splitedClear, 1, 1)) {
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
    console.log('Encrypted mailToken: ' + encryptedMail);
    let decryptedMail = decrypt(encryptedMail);
    //mailen er stadig encoded
    //se om mail eksisterer i database.
    let password = req.body.password;
    console.log('testPass: ' + req.body.password);

    // sammenligning skal gøres på frontend og ikke her.

    console.log('Password: ' + password + ' Email: ' + decode(decryptedMail));
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
