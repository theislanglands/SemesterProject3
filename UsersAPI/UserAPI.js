var users = [];

var conSecs = [];

// eslint-disable-next-line require-jsdoc
class User {
    // eslint-disable-next-line require-jsdoc
    constructor(userId, email, username, password, fName, lName, subType, admin) {
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.password = password;
        this.fName = fName;
        this.lName = lName;
        this.subType = subType;
        this.admin = admin;
    }
    // eslint-disable-next-line require-jsdoc
    changePassword(newPassword) {
        this.password = newPassword;
    }
}
users.push(new User(1, 'markusmunks@gmail.com', 'markus123', '123', 'markus', 'munk', 1, true));
users.push(new User(1, 'kontakt@ardit.dk', 'markus123', '123', 'markus', 'munk', 1, true));
// eslint-disable-next-line require-jsdoc
class ConSec {
    // eslint-disable-next-line require-jsdoc
    constructor(userId, refreshID, userAgent) {
        this.userId = userId;
        this.refreshId = refreshID;
        this.userAgent = userAgent;
    }
}

/**
 *
 * @param {*} refreshId
 */
function isRefreshId(refreshId) {
    for (let i = 0; i < conSecs.length; i++) {
        if (conSecs[i].refreshId == refreshId) {
            return true;
        }
    }
    return false;
}
/**
 *
 * @param {*} arr
 * @param {*} value
 */
function removeItem(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}
/**
 *
 * @param {*} refreshId
 */
function removeRefreshId(refreshId) {
    conSecs = removeItem(conSecs, getConSecByRefreshId(refreshId));
    return true;
}
/**
 *
 * @param {*} userId
 */
function getConSecsByUserId(userId) {
    // eslint-disable-next-line no-undef
    arr = [];
    for (let i = 0; i < conSecs.length; i++) {
        if (conSecs[i].userId == userId) {
            // eslint-disable-next-line no-undef
            arr.push(conSecs[i]);
        }
    }
    // eslint-disable-next-line no-undef
    return arr;
}
/**
 *
 * @param {*} refreshId
 */
function getConSecByRefreshId(refreshId) {
    for (let i = 0; i < conSecs.length; i++) {
        if ((conSecs[i].refreshID = refreshId)) {
            return conSecs[i];
        }
    }
}
/**
 *
 * @param {*} email
 */
function getUserFromEmail(email) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].email == email) {
            return users[i];
        }
    }
}
/**
 *
 * @param {*} userId
 */
/* function getUserByUserId(userId) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].userId == userId) {
            return users[i];
        }
    }
} */
/**
 *
 * @param {*} username
 */
function getUserByUsername(username) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].username == username) {
            return users[i];
        }
    }
}
/**
 *
 * @param {*} email
 * @param {*} password
 */
function changePassword(email, password) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].email == email) {
            users[i].changePassword(password);
            return true;
        }
    }
    return false;
}
/**
 *
 * @param {*} user
 */
/* function deleteUser(user) {} */

/**
 *
 * @param {*} username
 * @param {*} password
 */
function isCredentialsValid(username, password) {
    let user = getUserByUsername(username);
    if (user === undefined) {
        return false;
    }
    if (user.password === password) {
        return true;
    } else {
        return false;
    }
}
const express = require('express');
const server = express();
const bodyParser = require('body-parser');
server.use(bodyParser.json());
server.use(
    bodyParser.urlencoded({
        extended: true
    })
);

server.use(express.static('html'));

server.get('/checkCredentials', function (req, res) {
    // GET to Data Security DB
    let username = req.body.username;
    let password = req.body.password;
    let answer = isCredentialsValid(username, password);
    console.log(username + 'and' + password + ' is stored: ' + answer);
    res.send(answer);
});

// /users/storeRefreshId
server.get('/storeRefreshId', function (req, res) {
    // GET to Data Security DB
    let username = req.body.username;
    let refreshId = req.body.refreshId;
    let userAgent = req.body.userAgent;

    let userId = getUserByUsername(username).userId;
    conSecs.push(new ConSec(userId, refreshId, userAgent));

    console.log('stored refresh id: ' + refreshId);

    res.send('true');
});
server.get('/checkRefreshId', function (req, res) {
    // GET to DATA SECURITY DB
    let refreshId = req.body.refreshId;
    let bool = isRefreshId(refreshId);
    res.send(bool.toString());
});

server.get('/removeRefreshId', function (req, res) {
    // GET to DATA SECURITY DB
    let refreshId = req.body.refreshId;
    let bool = removeRefreshId(refreshId);
    res.send(bool.toString());
});
server.post('/getUserAgents', function (req, res) {
    let username = req.body.username;
    let userId = getUserByUsername(username).userId;
    let arr = getConSecsByUserId(userId);
    let userAgents = [];
    for (let i = 0; i < arr.length; i++) {
        userAgents.push({
            userAgent: arr[i].userAgent,
            refreshId: arr[i].refreshId
        });
    }
    res.send(userAgents);
});
server.post('/getUserPayload', function (req, res) {
    // SUBSCRIPTION DB
    let username = req.body.username;
    let user = getUserByUsername(username);
    let arr = [];
    arr.push(user.userId);
    arr.push(user.username);
    arr.push(user.subType);
    arr.push(user.admin);
    res.send(arr);
});
server.post('/isUser', function (req, res) {
    let email = req.body.email;
    console.log('hello');
    let user = getUserFromEmail(email);
    if (user instanceof User) {
        console.log('true');
        res.send(true);
    } else {
        res.send(false);
    }
});

server.post('/newPassword', function (req, res) {
    let email = req.body.email;
    if (getUserFromEmail(email) instanceof User) {
        let password = req.body.password;
        let bool = changePassword(email, password);
        res.send(bool.toString());
    } else {
        res.send('false');
    }
});

var server1 = server.listen(9090, function () {
    var host = server1.address().address;
    var port = server1.address().port;

    console.log('userAPI listening at http://%s:%s', host, port);
});
