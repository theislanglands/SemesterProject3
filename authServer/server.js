/* eslint-disable no-undef */
const express = require('express');
const app = express();
const fetch = require('node-fetch');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env' });

const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');

const jwt = require('jsonwebtoken');

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const privateKey = fs.readFileSync('./private.key', 'utf8');

//should be distributed to all services needing to verify the signature of the access token

// Access-Control-Allow-Headers... which ones? Accept removed
app.use(function (req, res, next) {
    //Client asks, wheter this service will accept their origin. WE ACCEPT ALL ORIGINS
    res.header('Access-Control-Allow-Origin', '*'); //shoud only accept request from the sites root domain
    //This service only accepts request with the following headers: Origin, X-req...
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type');
    //may the credentials be exposed/saved by the front-end/browser. e.g. cookies (necessary to save cookies)
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

//secret for signing refresh tokens
//should be in a secret file
let refreshSecret = fs.readFileSync('./refreshSecret.key', 'utf8');
//subscription db URL
// eslint-disable-next-line no-undef
const subscriptionURL = process.env.SUBSCRIPTION_URL_MOCK;
//connetionSecurity URL
// eslint-disable-next-line no-undef
const dataSecurityURL = process.env.DATASECURITY_URL_MOCK;
//own service URL
// eslint-disable-next-line no-undef
//eslint-disable-next-line no-unused-vars
const serviceUrl = process.env.SERVICE_URL_MOCK;

//age of access token
const fiveMins = 5 * 60 * 1000;

//age of refresh token
const oneWeek = 7 * 24 * 3600 * 1000;

//options for the access token cookie
const authCookieOptions = {
    maxAge: fiveMins,
    httpOnly: false,
    secure: true,
    sameSite: 'lax'
    //domain: serviceUrl
};

//options for refresh token cookie
const refreshCookieOptions = {
    maxAge: oneWeek,
    httpOnly: true,
    secure: true, //kun midlertidig
    sameSite: 'lax'
    //domain: serviceUrl
};

//receives access- and refresh token, and return a new valid access token
app.post('/refresh', authenticateRefreshToken, (req, res) => {
    //gets the userdata in the old access token and tranfers it to a new accesstoken
    const userPayload = jwt.decode(req.cookies.authcookie);

    //used to store new refresh id in data security db, so than whenever the refresh id is verified in db, we store a new one and deletes the old refresh id
    const email = userPayload.email;
    const userAgent = req.get('user-agent');
    const newRefreshId = uuidv4();

    const newAccessToken = generateAccessToken(userPayload);
    const newRefreshToken = generateRefreshToken({
        username: userPayload.username,
        refreshId: newRefreshId
    });
    try {
        removeRefreshId(req.decodedRefreshToken.refreshId).then((isRemoved) => {
            if (isRemoved) {
                storeRefreshId(email, newRefreshId, userAgent).then((isStored) => {
                    if (isStored) {
                        //adds the access and refresh and token as cookies to the response
                        res.cookie('authcookie', newAccessToken, authCookieOptions);
                        res.cookie('refreshcookie', newRefreshToken, refreshCookieOptions);
                        res.send('succesfully refreshed tokens');
                    } else {
                        res.status(424).send('storing refresh id failed');
                    }
                });
            } else {
                res.status(403).send('could not invalidate refresh id');
            }
        });
    } catch (e) {
        res.status(424).send(e);
    }
});

//logs in the user with username and password. return a new access- and refresh token
app.post('/login', (req, res) => {
    //gets email, password and the requests origin device
    const email = req.body.email;
    const userAgent = req.get('user-agent');
    const password = req.body.password;

    try {
        //checks the existence of the credentials in the db
        login(email, password).then((isAuth) => {
            if (isAuth) {
                getUserId(email).then((userId) => {
                    console.log('logged in as: ' + email + ' from device: ' + userAgent);

                    //get userId, username, subscription mode(int), admin (bool)
                    getSubscriptionType(userId).then((subType) => {
                        //genereates new refresh id
                        const refreshId = uuidv4();

                        //stores the refreesh id persistent in DB
                        storeRefreshId(email, refreshId, userAgent).then((bool) => {
                            //should always be true
                            if (bool) {
                                //issue access token with payload
                                const payload = {
                                    subType: subType,
                                    email: email,
                                    userId: userId
                                };
                                const accesstoken = generateAccessToken(payload);
                                const refreshToken = generateRefreshToken({
                                    email: email,
                                    refreshId: refreshId
                                });

                                //add the tokens as cookie in the response
                                res.cookie('authcookie', accesstoken, authCookieOptions);
                                res.cookie('refreshcookie', refreshToken, refreshCookieOptions);
                                res.send(
                                    'succesfully logged in, and recieved auth + refresh token as cookies'
                                );
                            } else {
                                //somewting went wrong in the db, and the refresh id could not be stored
                                console.log('could not store refresh id');
                            }
                        });
                    });
                });
            } else {
                //provided username + password did not match any users in DB
                return res.status(401).send(`Cannot find account with mail: ${email}`);
            }
        });
    } catch (e) {
        res.status(424).send(e);
    }
});

//logs out user device.
app.post('/logout', authenticateRefreshToken, (req, res) => {
    //if body contains a refresh id, the user wants to logout another device (invalidate a refresh id assoicated with another device)
    //might not be completely secure
    //should maybe use the access token instead
    let refreshId = req.decodedRefreshToken.refreshId;
    if (req.body.refreshId) {
        refreshId = req.body.refreshId;
        console.log('logging out a device refresh id: ' + refreshId);
    }
    try {
        //removes row associated with refresh id to invalidate refreshToken
        removeRefreshId(refreshId).then((isRemoved) => {
            if (isRemoved) {
                res.sendStatus(200);
            } else {
                res.status(403).send('you need to be signed in to log out');
            }
        });
    } catch (e) {
        res.status(424).send(e);
    }
});

app.post('/getUserAgents', authenticateRefreshToken, (req, res) => {
    getUserAgentsAndRefreshId(req.decodedRefreshToken.username).then((agentList) => {
        res.status(200).json(agentList);
    });
});

/**
 * middleware for verifying and checking the existance of access token in db
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function authenticateRefreshToken(req, res, next) {
    const refreshToken = req.cookies.refreshcookie;
    console.log('authenticating refreshtoken: ' + refreshToken);
    //verifies signature of refresh token and returns the payload (refresh id and username)
    jwt.verify(refreshToken, refreshSecret, (err, data) => {
        if (err) {
            res.sendStatus(403);
        } else {
            try {
                verifyRefreshId(data.refreshId).then((bool) => {
                    console.log(bool);
                    if (bool) {
                        req.decodedRefreshToken = data;
                        console.log('Refresh cookie verified');
                        next();
                    } else {
                        res.status(403).send('could not verify refresh id');
                    }
                });
            } catch (e) {
                res.status(424).send(e);
            }
        }
    });
}

/**
 * return a new signed access token
 * @param {*} userdata
 */
function generateAccessToken(userdata) {
    //relevant data for access token
    const data = {
        userId: userdata.userId,
        username: userdata.username,
        subType: userdata.subType
    };
    return jwt.sign(data, privateKey, { expiresIn: '5m', algorithm: 'RS256' });
}
/**
 *
 * @param {*} userdata
 */
function generateRefreshToken(userdata) {
    return jwt.sign(userdata, refreshSecret, { expiresIn: '7d' });
}

//Listen
const port = 3300;
app.listen(port, () => {
    console.log('AuthService listening on port: ' + port);
});

/**
 * functions for querying database
 * @param {*} username
 */
function getSubscriptionType(userId) {
    return fetch(subscriptionURL + '/customer/' + userId + '/get_subscription_type', {
        // SHOULD POST TO SUBSCRIPTION TEAM DATABASE INSTEAD
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((res) => {
            return res.text();
        })
        .then((data) => {
            data = JSON.parse(data);
            return data;
        })
        .catch((error) => {
            console.error('function getSubscriptionType fail fetch', error);
            console.log("coudn't login");
        });
}
/**
 *
 * @param {*} username
 */
function getUserId(username) {
    return fetch(dataSecurityURL + '/getUserId', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'text/plain'
        },
        body: JSON.stringify({ username: username })
    })
        .then((res) => {
            return res.text();
        })
        .then((data) => {
            console.log(data);
            return data;
        })
        .catch((error) => {
            console.error('function getUserId fail fetch', error);
        });
}
/**
 *
 * @param {*} email
 * @param {*} password
 */
function login(email, password) {
    return fetch(dataSecurityURL + '/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'text/plain'
        },
        body: JSON.stringify({ email: email, password: password })
    })
        .then((res) => {
            return res.text();
        })
        .then((data) => {
            console.log(data);
            return data === 'true';
        })
        .catch((error) => {
            console.error('function Login() fail fetch', error);
        });
}
/**
 *
 * @param {*} email
 * @param {*} refreshId
 * @param {*} userAgent
 */
function storeRefreshId(email, refreshId, userAgent) {
    return fetch(dataSecurityURL + '/refresh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'text/plain'
        },
        body: JSON.stringify({ email: email, refreshId: refreshId, userAgent: userAgent })
    })
        .then((res) => {
            return res.text();
        })
        .then((data) => {
            return data === 'true';
        })
        .catch((error) => {
            console.error('function storeRefreshId fail fetch', error);
        });
}
/**
 *
 * @param {*} refreshId
 */
function verifyRefreshId(refreshId) {
    return fetch(dataSecurityURL + '/checkrefresh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'text/plain'
        },
        body: JSON.stringify({ refreshId: refreshId })
    })
        .then((res) => {
            return res.text();
        })
        .then((data) => {
            console.log(data);
            return data === 'true';
        })
        .catch((error) => {
            console.error('function verifyRefreshId fail fetch', error);
        });
}
/**
 *
 * @param {*} refreshId
 */
function removeRefreshId(refreshId) {
    return fetch(dataSecurityURL + '/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'text/plain'
        },
        body: JSON.stringify({ refreshId: refreshId })
    })
        .then((res) => {
            return res.text();
        })
        .then((data) => {
            return data === 'true';
        })
        .catch((error) => {
            console.error('function removeRefreshId fail fetch', error);
        });
}

/**
 * gives a username and recieves all user-agents + refreshId, så that a user could log out other divivs currently logged in
 * @param {*} username //data security expect the body to contain a field with key "username", although in reality it is a email
 */
function getUserAgentsAndRefreshId(username) {
    return fetch(dataSecurityURL + '/getUserAgents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'text/plain'
        },
        body: JSON.stringify({ username: username })
    })
        .then((res) => {
            return res.text();
        })
        .then((data) => {
            console.log(data);
            return JSON.parse(data);
        })
        .catch((error) => {
            console.error('function getUserAgentsAndFreshId fail fetch', error);
        });
}
