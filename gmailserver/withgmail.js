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
const secret = 'hey';

//const key = crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0, 32);
//console.log('key: ' + key);

const algorithm = 'aes-128-cbc';


const iv = crypto.randomBytes(16);
const salt = "foobar";
const hash = crypto.createHash("sha1");

hash.update(salt);

let key = hash.digest().slice(0, 16);





function encrypt(text) {
    //Undersg iv, fordi denne funtion er outdated
    if (typeof text == 'string') {
        var cipher = crypto.createCipheriv(algorithm, key, iv);
        var encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        //console.log(typeof encrypted);
        return encrypted;
    } else {
        console.log("The parameter wasn't a string, try agian");
    }
}
function decrypt(text) {
    //Undersg iv, fordi denne funtion er outdated
    if (typeof text == 'string') {
        var decipher = crypto.createDecipheriv(algorithm, key, iv);
        var decrypted = decipher.update(text, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        //console.log(typeof decrypted);
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

server.post('/forgotPass', urlencodedParser, function (req, res) {
    let endEmail = validator.escape(req.body.email);
    if (validator.isEmail(endEmail)) {
        mailTransporter = createMailTransporter(mailService, serverEmail, serverEmailPass);
        let date = new Date();
        let dateString = date.getTime().toString();
        console.log('DateString: ' + dateString);
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
        mailDetails = createMailDetails(serverEmail, endEmail, hyperlinkInEmail + '?' + encrypted);
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
            email = splitedClear[0];
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
server.post('/resetPassword_form', urlencodedParser, function (req, res) {
    const encryptedMail = req.cookies.mailtoken;
    if (encryptedMail === undefined) {
        res.sendStatus(406);
        return;
    }
    console.log('Encrypted mailToken: ' + encryptedMail);
    let decryptedMail = decrypt(encryptedMail);
    if (encryptedMail === undefined) {
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

    console.log('Password: ' + password + ' Email: ' + decode(decryptedMail));

    res.sendStatus(200);
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
