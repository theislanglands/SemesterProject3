const express = require('express');
const app = express();
const fetch = require('node-fetch');
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

// Access-Control-Allow-Headers... which ones? Accept removed
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
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
const dbURL = 'http://localhost:8082';

const fiveMins = 5 * 60 * 1000;
const oneWeek = 7 * 24 * 3600 * 1000;

app.post('/auth/refresh', authenticateRefreshToken, (req, res) => {
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
                sameSite: 'lax',
                domain: 'http://localhost:8080'
            });
            res.cookie('refreshcookie', newRefreshToken, {
                maxAge: oneWeek,
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                domain: 'http://localhost:8080'
            });
            res.send();
        } else {
            console.log('buh');
            //redirect to login page. "user need to login to get new access + refresh token"
        }
    });
});

app.post('/auth/login', (req, res) => {
    const username = req.body.username;
    const userAgent = req.headers.userAgent;
    console.log(username);
    const password = req.body.password;
    login(username, password).then((bool1) => {
        if (bool1) {
            const refreshId = uuidv4();
            getUserPayload(username).then((userPayload) => {
                playLoad = {
                    userId: userPayload[0],
                    username: userPayload[1],
                    subType: userPayload[2],
                    admin: userPayload[3]
                };
                storeRefreshId(username, refreshId, userAgent).then((bool) => {
                    if (bool) {
                        const accesstoken = generateAccessToken(playLoad);
                        const refreshToken = generateRefreshToken({
                            username: playLoad.username,
                            refreshId: refreshId
                        });

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
                        //could not store refresh id. Something went wrong
                    }
                });
            });
        } else {
            //provided username + password did not match any users in DB
            return res.status(400).send(`Cannot find user with username: ${username}`);
        }
    });
});

app.post('/auth/logout', authenticateRefreshToken, (req, res) => {
    removeRefreshId(req.user.refreshId).then((bool) => {
        if (bool) {
            //succesfully logged out - should redirect user
            res.sendStatus(200);
        }
    });
});

app.post('/auth/getUserAgents', authenticateRefreshToken, (req, res) => {
    getUserAgentsAndRefreshId(req.user.username).then((agentList) => {
        res.status(200).json(agentList);
    });
});

function authenticateRefreshToken(req, res, next) {
    const refreshCookie = req.cookies.refreshcookie;
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
    return fetch(dbURL + '/getUserPayload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/plain'
        },
        body: 'username=' + encodeURIComponent(username)
    })
        .then((res) => {
            return res.text();
        })
        .then((data) => {
            return data;
        })
        .catch((error) => {
            console.error('error: ', error);
        });
}

function login(username, password) {
    return fetch(dbURL + '/checkCredentials', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/plain'
        },
        body:
            'username=' +
            encodeURIComponent(username) +
            '&' +
            'password=' +
            encodeURIComponent(password)
    })
        .then((res) => {
            return res.text();
        })
        .then((data) => {
            console.log(data);
            return data;
        })
        .catch((error) => {
            console.error('error: ', error);
        });
}

function storeRefreshId(username, refreshId, userAgent) {
    return fetch(dbURL + '/storeRefreshId', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/plain'
        },
        body:
            'username=' +
            encodeURIComponent(username) +
            '&refreshId=' +
            encodeURIComponent(refreshId) +
            '&userAgent=' +
            encodeURIComponent(userAgent)
    })
        .then((res) => {
            return res.text();
        })
        .then((data) => {
            return data;
        })
        .catch((error) => {
            console.error('error: ', error);
        });
    return bool;
}

function verifyRefreshId(refreshId) {
    return fetch(dbURL + '/checkRefreshId', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/plain'
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
    return fetch(dbURL + '/removeRefreshId', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/plain'
        },
        body: JSON.stringify({ username, refreshId, userAgent })
    })
        .then((res) => {
            return res.body;
        })
        .then((data) => {
            return JSON.parse(data).someAttributeResolvingToTrueOrFalse;
        })
        .catch((error) => {
            console.error('error: ', error);
        });
}

function getUserAgentsAndRefreshId(username) {
    return fetch('/getUserAgents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/plain'
        },
        body: JSON.stringify({ username, refreshId, userAgent })
    })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            return JSON.parse(data).someAttributeContiangLIST; //list<{refreshId, userAgent}>
        })
        .catch((error) => {
            return console.error('error: ', error);
        });
}
