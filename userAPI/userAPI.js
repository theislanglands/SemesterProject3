//user API contains mock endpoint for both subscription TEAM and DATASECURITY TEAMS.

const express = require('express');
const server = express();
const port = 9090;
const bodyParser = require('body-parser');
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.post('/getUserId', (req, res) => {
    //get userId with given username
    const userId = getUserIdByUsername(req.body.username);
    res.json(userId);
});
function getUserIdByUsername(username) {
    let userId = -1;
    users.forEach((user) => {
        if ((user.email = username)) {
            userId = user.userId;
        }
    });
    return userId;
}

server.post('/customer/:userId/get_subscription_type', (req, res) => {
    //get subscription type of user with given user id
    const subType = getSubTypeByUserId(req.params.userId);
    res.json(subType);
});

function getSubTypeByUserId(userId) {
    let subType = 1;
    userSubType.forEach((user) => {
        if (user.userId == userId) {
            subType = user.subType;
        }
    });
    return subType; //static subtype = 1, in case, no substype is associated with the given userId
}

server.post('/login', (req, res) => {
    //check wehter the given password and email mathces a user
    //return true if credentials exist
    const isRegistered = checkCredentials(req.body.email, req.body.password);
    res.send(isRegistered);
});

function checkCredentials(email, password) {
    let isRegistered = false;
    users.forEach((user) => {
        if (user.email == email && user.password == password) {
            isRegistered = true;
        }
    });
    return isRegistered;
}

server.post('/refresh', (req, res) => {
    //stores refresh id, with user agent and username
    devices.push(new Device(req.body.email, req.body.userAgent, req.body.refreshId));
    res.send(true);
});

server.post('/checkrefresh', (req, res) => {
    //check existance of refresh id
    const hasRefreshId = refreshIdExists(req.body.refreshId);
    res.send(hasRefreshId);
});

function refreshIdExists(refreshId) {
    let hasRefreshId = false;
    devices.forEach((device) => {
        if (device.refreshId == refreshId) {
            hasRefreshId = true;
        }
    });
    return hasRefreshId;
}

server.post('/logout', (req, res) => {
    //removes a row associated with a refresh id
    logoutDevice(req.body.refreshId);
    res.send(true);
});

function logoutDevice(refreshId) {
    for (let i = 0; i < devices.length; i++) {
        if (devices[i].refreshId == refreshId) {
            devices.splice(i, 1);
        }
    }
}

server.post('/isUser', function (req, res) {
    let email = req.body.email;
    let user = getUserByEmail(email);
    if (user instanceof User) {
        res.send(true);
    } else {
        res.send(false);
    }
});

function getUserByEmail(email) {
    let user = undefined;
    users.forEach((el) => {
        if (el.email == email) {
            user = el;
        }
    });
    return user;
}

server.post('/newPassword', function (req, res) {
    let email = req.body.email;
    const user = getUserByEmail(email);
    if (user instanceof User) {
        user.password = req.body.password;
        res.send(true);
    } else {
        res.send(false);
    }
});

server.listen(port, () => {
    console.log('userAPI is listening on port:' + port);
});

//non-persistent database for datasecurity team: initially no devices/users are logged in (i.e. no refresh id's are stored)
const devices = [];
class Device {
    constructor(email, userAgent, refreshId) {
        this.email = email;
        this.userAgent = userAgent;
        this.refreshId = refreshId;
    }
}

//non-persistent database for datasecurity team
const users = [];
class User {
    constructor(userId, email, password) {
        this.userId = userId;
        this.email = email;
        this.password = password;
    }
}

//non-persistent database for subscription team
const userSubType = [];
class SubType {
    constructor(userId, subType) {
        this.userId = userId;
        this.subType = subType;
    }
}

//registered users:
users.push(new User(1, 'markusmunks@gmail.com', 123));

//user subtypes:
userSubType.push(new SubType(1, 1)); //subscription Type for markusmunks@gmail.com = 1
