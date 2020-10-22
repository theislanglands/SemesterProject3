const express = require('express');
const app = express();

const path = require('path');

const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');

const jwt = require('jsonwebtoken');

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

//Listen
app.listen(3300, () => {
    console.log('Connected');
});

const users = [
    {
        username: 'Pat',
        password: 'hej'
    }
];

const refreshTokens = [];

let secret = 'tihifnis';
let refreshSecret = 'vrysecuresecret';
app.post('/auth/login', (req, res) => {
    let username = req.body.username;
    const user = users.find((user) => user.username === req.body.username);

    if (user == null) {
        return res.status(400).send(`Cannot find user with username: ${username}`);
    }

    console.log(user);

    if (user.password == req.body.password) {
        const accesstoken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        var fiveMins = 5 * 60 * 1000;
        var oneWeek = 7 * 24 * 3600 * 1000;
        res.cookie('authcookie', accesstoken, {
            maxAge: fiveMins,
            httpOnly: false,
            secure: true,
            sameSite: 'lax'
        });
        res.cookie('refreshcookie', refreshToken, {
            maxAge: oneWeek,
            httpOnly: true,
            secure: true,
            sameSite: 'lax'
        });
        res.send();
    } else {
        console.log('Invalid password');
    }
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname + '/home.html'));
});

function authenticateToken(req, res, next) {
    const authcookie = req.cookies.authcookie;
    console.log(authcookie);
    console.log(req.cookies);
    jwt.verify(authcookie, process.env.SECRET, (err, data) => {
        if (err) {
            res.sendStatus(403);
        } else if (data.user) {
            req.user = data.user;
            next();
        }
    });
}

function authenticateRefreshToken(req, res, next) {
    const refreshCookie = req.cookies.refreshcookie;
    if (refreshTokens.includes(refreshCookie)) {
        jwt.verify(refreshCookie, refreshSecret, (err, data) => {
            if (err) {
                res.sendStatus(403);
            } else if (data.user) {
                req.user = data.user;
            }
            next();
        });
    }
}

function generateAccessToken(user) {
    return jwt.sign(user, secret, { expiresIn: '5m' });
}

function generateRefreshToken(user) {
    return jwt.sign(user, refreshSecret, { expiresIn: '7d' });
}

app.get('/api', authenticateToken, (req, res) => {
    console.log('Cookie checked, success');
});
