const express = require('express');
const app = express();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const path = require('path');

const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');

const jwt = require('jsonwebtoken');

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const privateKey = fs.readFileSync('./private.key', 'utf8');
const publicKey = fs.readFileSync('./public.key', 'utf8');

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

app.get('/auth/refresh', authenticateRefreshToken, (req, res) => {
    const refreshToken = req.cookies.refreshcookie;
    const payload = jwt.decode(refreshToken);
    //check for refresh id in DB
    verifyRefreshId(payload.refreshId).then((bool) => {
        if (bool) {
            const decodedRefreshToken = jwt.decode(refreshToken);
            const accessToken = generateAccessToken({ username: decodedRefreshToken.username });
            const newRefreshToken = generateRefreshToken({
                username: decodedRefreshToken.username,
                refreshId: decodedRefreshToken.refreshId
            });
            res.cookie('authcookie', accessToken, {
                maxAge: fiveMins,
                httpOnly: false,
                secure: true,
                sameSite: 'lax'
            });
            res.cookie('refreshcookie', newRefreshToken, {
                maxAge: oneWeek,
                httpOnly: true,
                secure: true,
                sameSite: 'lax'
            });
            res.send();
        } else {
            //redirect to login page. "user need to login to get new access + refresh token"
        }
    });
});

app.post('/auth/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    login(username, password).then((res) => {
        if (res) {
            refreshId = uuidv4();

            const accesstoken = generateAccessToken({ username: user.username });
            const refreshToken = generateRefreshToken({
                username: user.username,
                refreshId: refreshId
            });
            console.log(refreshToken);

            res.cookie('authcookie', accesstoken, {
                maxAge: fiveMins,
                httpOnly: false,
                secure: true, //kun midlertidig
                sameSite: 'lax'
            });
            res.cookie('refreshcookie', refreshToken, {
                maxAge: oneWeek,
                httpOnly: true,
                secure: true, //kun midlertidig
                sameSite: 'lax'
            });
            res.send();
        } else {
            //provided username + password did not match any users in DB
            return res.status(400).send(`Cannot find user with username: ${username}`);
        }
    });
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

function generateAccessToken(userdata) {
    return jwt.sign(userdata, privateKey, { expiresIn: '5m', algorithm: 'RS256' });
}

function generateRefreshToken(userdata) {
    return jwt.sign(userdata, refreshSecret, { expiresIn: '7d' });
}

//Listen
app.listen(3300, () => {
    console.log('Connected');
});

//functions for querying database

function getUserPayload(username) {
    return fetch('ednPointForGettingUserPayload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json'
        },
        body: JSON.stringify({ username })
    })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            return JSON.parse(data);
        })
        .catch((error) => {
            console.error('error: ', error);
        });
}

function login(username, password) {
    return fetch('login end point', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            return JSON.parse(data).someAttributeResolvingToTrueOrFalse;
        })
        .catch((error) => {
            console.error('error: ', error);
        });
}

function createUUID() {
    //some logic for creating UUID, for the refresh ID
}

function storeRefreshId(username, refreshId, userAgent) {
    return fetch('putRefreshId-endpoint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json'
        },
        body: JSON.stringify({ username, refreshId, userAgent })
    })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            return JSON.parse(data).someAttributeResolvingToTrueOrFalse;
        })
        .catch((error) => {
            console.error('error: ', error);
        });
}

function verifyRefreshId(refreshId) {
    return fetch('verifryRefreshId-endpoint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json'
        },
        body: JSON.stringify({ username, refreshId, userAgent })
    })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            return JSON.parse(data).someAttributeResolvingToTrueOrFalse;
        })
        .catch((error) => {
            console.error('error: ', error);
        });
}

function removeRefreshId(refreshId) {
    return fetch('removeREFResh ID-endpoint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json'
        },
        body: JSON.stringify({ username, refreshId, userAgent })
    })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            return JSON.parse(data).someAttributeResolvingToTrueOrFalse;
        })
        .catch((error) => {
            console.error('error: ', error);
        });
}

function getUserAgentsAndRefreshId(username) {
    return fetch('userAgentList -endpoint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json'
        },
        body: JSON.stringify({ username, refreshId, userAgent })
    })
        .then((res) => {
            return nres.json();
        })
        .then((data) => {
            return JSON.parse(data).someAttributeContiangLIST; //list<{refreshId, userAgent}>
        })
        .catch((error) => {
            return console.error('error: ', error);
        });
}
