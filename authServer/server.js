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

//should be distributed to all services needing to verify the signature of the access token
const publicKey = fs.readFileSync('./public.key', 'utf8');

// Access-Control-Allow-Headers... which ones? Accept removed
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

//secret for signing refresh tokens
//should be in a secret file and
let refreshSecret = `
4cq9joRISzk2CFdmaAsCyf227T34ywSMvqlnaU5js53HevyYe5jjzVGdojcxtR/0
Cl8PH1vFUdcVlLR+fBZDCDgRqY6lY4RdRx+tHDc87cwpFXBEQ5Gx1YOhCG4QNDJ5
a3udgHqL8KZCwytPG5fjGjmOoXcAvfaFzrsg29aJ30vpYzhSdaJZpJnAbzOIv4ET
MJbUgqwYRpsRKhkEaq/5PCQUekpOP/QxyQbLhg63eyaMC0FGiYq36FkpQTGh41hR
DsdwnhBovGLYR8B5LN5GtPF8bwERZhqWqYjD92sZb0Frihf6IkqZO5grgFUIJ8GE
Imd5Dp3hkUvG2gstKjWLrw==
`;
const dbURL = 'http://usersservice:9090';
const serviceUrl = 'http://localhost:8080';
//age of access token
const fiveMins = 5 * 60 * 1000;

//age of refresh token
const oneWeek = 7 * 24 * 3600 * 1000;

//options for the access token cookie
const authCookieOptions = {
    maxAge: fiveMins,
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    domain: serviceUrl
};

//options for refresh token cookie
const refreshCookieOptions = {
    maxAge: oneWeek,
    httpOnly: true,
    secure: true, //kun midlertidig
    sameSite: 'lax',
    domain: serviceUrl
};

//receives access- and refresh token, and return a new valid access token
app.post('/auth/refresh', authenticateRefreshToken, (req, res) => {
    //gets the userdata in the old access token and tranfers it to a new accesstoken
    const userPayload = jwt.decode(req.cookies.authcookie);
    const newAccessToken = generateAccessToken(userPayload);

    //bør vi invalidere refresh token, når access token refreshes?

    //adds the access and refresh and token as cookies to the response
    res.cookie('authcookie', newAccessToken, authCookieOptions);
    res.cookie('refreshcookie', req.cookies.refreshcookie, refreshCookieOptions);

    console.log('successfully issued new access token: ' + newAccessToken);
    res.send();
});

//logs in the user with username and password. return a new access- and refresh token
app.post('/auth/login', (req, res) => {
    //gets username, password and the requests origin device
    const username = req.body.username;
    const userAgent = req.get('user-agent');
    const password = req.body.password;

    //checks the existence of the credentials in the db
    login(username, password).then((bool1) => {
        if (bool1) {
            console.log('logged in as: ' + username + ' from device: ' + userAgent);

            //get userId, username, subscription mode(int), admin (bool)
            getUserPayload(username).then((payload) => {
                //genereates new refresh id
                const refreshId = uuidv4();

                //stores the refreesh id persistent in DB
                storeRefreshId(username, refreshId, userAgent).then((bool) => {
                    //should always be true
                    if (bool) {
                        //issue access token with payload
                        const accesstoken = generateAccessToken(payload);
                        const refreshToken = generateRefreshToken({
                            username: payload.username,
                            refreshId: refreshId
                        });

                        //add the tokens as cookie in the response
                        res.cookie('authcookie', accesstoken, authCookieOptions);
                        res.cookie('refreshcookie', refreshToken, refreshCookieOptions);
                        res.send();
                    } else {
                        //somewting went wrong in the db, and the refresh id could not be stored
                        console.log('could not store refresh id');
                    }
                });
            });
        } else {
            //provided username + password did not match any users in DB
            return res.status(400).send(`Cannot find user with username: ${username}`);
        }
    });
});

//logs out user device.
app.post('/auth/logout', authenticateRefreshToken, (req, res) => {
    //if body contains a refresh id, the user want to logout another device (invalidate a refresh id assoicated with another device)
    //might not be completely secure
    //should maybe use the access token instead
    let refreshId = req.decodedRefreshToken.refreshId;
    if (req.body.refreshId) {
        refreshId = req.body.refreshId;
        console.log('logging out a device refresh id: ' + refreshId);
    }

    //removes row associated with refresh id to invalidate refreshToken
    removeRefreshId(refreshId).then((bool) => {
        if (bool) {
            console.log('succesfully removed refresh id' + refreshId);
            res.sendStatus(200);
        } else {
            console.log('could not log out - something went wrong.');
            res.sendStatus(405);
        }
    });
});

app.post('/auth/getUserAgents', authenticateRefreshToken, (req, res) => {
    getUserAgentsAndRefreshId(req.decodedRefreshToken.username).then((agentList) => {
        res.status(200).json(agentList);
    });
});

//middleware for verifying and checking the existance of access token in db
function authenticateRefreshToken(req, res, next) {
    const refreshToken = req.cookies.refreshcookie;
    console.log('authenticating refreshtoken: ' + refreshToken);
    //verifies signature of refresh token and returns the payload (refresh id and username)
    jwt.verify(refreshToken, refreshSecret, (err, data) => {
        if (err) {
            res.sendStatus(403);
        } else {
            verifyRefreshId(data.refreshId).then((bool) => {
                console.log(bool);
                if (bool) {
                    req.decodedRefreshToken = data;
                    console.log('Refresh cookie verified');
                    next();
                } else {
                    res.sendStatus(403);
                }
            });
        }
    });
}

//return a new signed access token
function generateAccessToken(userdata) {
    //relevant data for access token
    const data = {
        userId: userdata.userId,
        username: userdata.username,
        subType: userdata.subType,
        admin: userdata.admin
    };
    console.log('payload for access token: ' + data);
    return jwt.sign(data, privateKey, { expiresIn: '5m', algorithm: 'RS256' });
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
        // SHOULD POST TO SUBSCRIPTION TEAM DATABASE INSTEAD
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
            data = JSON.parse(data);
            const payload = {
                userId: data[0],
                username: data[1],
                subType: data[2],
                admin: data[3]
            };
            return payload;
        })
        .catch((error) => {
            console.error('error: ', error);
        });
}

function login(username, password) {
    return fetch(dbURL + '/checkCredentials', {
        method: 'GET',
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
            return data === 'true';
        })
        .catch((error) => {
            console.error('error: ', error);
        });
}

function storeRefreshId(username, refreshId, userAgent) {
    return fetch(dbURL + '/storeRefreshId', {
        method: 'GET',
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
            return data === 'true';
        })
        .catch((error) => {
            console.error('error: ', error);
        });
    return bool;
}

function verifyRefreshId(refreshId) {
    return fetch(dbURL + '/checkRefreshId', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/plain'
        },
        body: 'refreshId=' + encodeURIComponent(refreshId)
    })
        .then((res) => {
            return res.text();
        })
        .then((data) => {
            console.log(data);
            return data === 'true';
        })
        .catch((error) => {
            console.error('error: ', error);
        });
}

function removeRefreshId(refreshId) {
    return fetch(dbURL + '/removeRefreshId', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/plain'
        },
        body: 'refreshId=' + encodeURIComponent(refreshId)
    })
        .then((res) => {
            return res.text();
        })
        .then((data) => {
            return data === 'true';
        })
        .catch((error) => {
            console.error('error: ', error);
        });
}

//gives a username and recieves all user-agents + refreshId, så that a user could log out other divivs currently logged in
function getUserAgentsAndRefreshId(username) {
    return fetch(dbURL + '/getUserAgents', {
        method: 'GET',
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
            console.log(data);
            return JSON.parse(data);
        })
        .catch((error) => {
            return console.error('error: ', error);
        });
}
