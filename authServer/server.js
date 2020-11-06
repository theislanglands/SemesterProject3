const express = require('express');
const app = express();
const fs = require('fs');

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

const privateKey = fs.readFileSync('./private.key', 'utf8');
const publicKey = fs.readFileSync('./public.key', 'utf8');

// Access-Control-Allow-Headers... which ones? Accept removed
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

let refreshSecret = `
4cq9joRISzk2CFdmaAsCyf227T34ywSMvqlnaU5js53HevyYe5jjzVGdojcxtR/0
Cl8PH1vFUdcVlLR+fBZDCDgRqY6lY4RdRx+tHDc87cwpFXBEQ5Gx1YOhCG4QNDJ5
a3udgHqL8KZCwytPG5fjGjmOoXcAvfaFzrsg29aJ30vpYzhSdaJZpJnAbzOIv4ET
MJbUgqwYRpsRKhkEaq/5PCQUekpOP/QxyQbLhg63eyaMC0FGiYq36FkpQTGh41hR
DsdwnhBovGLYR8B5LN5GtPF8bwERZhqWqYjD92sZb0Frihf6IkqZO5grgFUIJ8GE
Imd5Dp3hkUvG2gstKjWLrw==
`;

const fiveMins = 5 * 60 * 1000;
const oneWeek = 7 * 24 * 3600 * 1000;

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
            secure: false, // Must be true when HTTPS is enabled (will only be sent over HTTPS if true)
            sameSite: 'lax',
            domain: 'http://localhost:8080'
        });
        res.cookie('refreshcookie', reRefreshToken, {
            maxAge: oneWeek,
            httpOnly: true,
            secure: false, // Must be true when HTTPS is enabled (will only be sent over HTTPS if true)
            sameSite: 'lax',
            domain: 'http://localhost:8080'
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

    if (user.password == req.body.password) {
        const accesstoken = generateAccessToken({ username: user.username });
        const refreshToken = generateRefreshToken({ username: user.username });
        refreshTokens.push(refreshToken);

        res.cookie('authcookie', accesstoken, {
            maxAge: fiveMins,
            httpOnly: false,
            secure: false, // Must be true when HTTPS is enabled (will only be sent over HTTPS if true)
            sameSite: 'lax'
        });
        res.cookie('refreshcookie', refreshToken, {
            maxAge: oneWeek,
            httpOnly: true,
            secure: false, // Must be true when HTTPS is enabled (will only be sent over HTTPS if true)
            sameSite: 'lax'
        });
        res.send();
    } else {
        console.log('Invalid password');
    }
});

function authenticateToken(req, res, next) {
    const authcookie = req.cookies.authcookie;
    jwt.verify(authcookie, publicKey, (err, data) => {
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
    return jwt.sign(user, privateKey, { expiresIn: '5m', algorithm: 'RS256' });
}

function generateRefreshToken(user) {
    return jwt.sign(user, refreshSecret, { expiresIn: '7d' });
}

//Listen
app.listen(3300, () => {
    console.log('Connected');
});
