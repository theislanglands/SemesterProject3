const express = require('express');
const app = express();

const path = require('path');

const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');

const jwt = require('jsonwebtoken');

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const users = [
    {
        username: 'Pat',
        password: 'hej'
    }
];

const refreshTokens = [];

let secret = 'tihifnis';
let refreshSecret = 'vrysecuresecret';

const fiveMins = 5 * 60 * 1000;
const oneWeek = 7 * 24 * 3600 * 1000;

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/html/index.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname + '/html/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/html/login-page.html'));
});

app.get('/music', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname + '/html/music.html'));
});

app.use(express.static('html'));

app.get('/auth/refresh', authenticateRefreshToken, (req, res) => {
    const refreshToken = req.cookies.refreshcookie;
    if (refreshTokens.includes(refreshToken)) {
        const decodedToken = jwt.decode(refreshToken);
        const accessToken = generateAccessToken({ username: decodedToken.username });
        const reRefreshToken = generateRefreshToken({ username: decodedToken.username });
        res.cookie('authcookie', accessToken, {
            maxAge: fiveMins,
            httpOnly: false,
            secure: true,
            sameSite: 'lax'
        });
        res.cookie('refreshcookie', reRefreshToken, {
            maxAge: oneWeek,
            httpOnly: true,
            secure: true,
            sameSite: 'lax'
        });
        res.send();
    }
});

app.post('/auth/login', (req, res) => {
    let username = req.body.username;
    const user = users.find((user) => user.username === req.body.username);

    if (user == null) {
        return res.status(400).send(`Cannot find user with username: ${username}`);
    }

    console.log(user);

    if (user.password == req.body.password) {
        const accesstoken = generateAccessToken({ username: user.username });
        const refreshToken = generateRefreshToken({ username: user.username });
        console.log(refreshToken);
        refreshTokens.push(refreshToken);

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

function authenticateToken(req, res, next) {
    const authcookie = req.cookies.authcookie;
    jwt.verify(authcookie, secret, (err, data) => {
        if (err) {
            res.sendStatus(403);
        } else if (data.user) {
            req.user = data.user;
        }
        next();
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
                console.log('Refresh cookie verified');
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

//Listen
app.listen(3300, () => {
    console.log("Connected");
});
