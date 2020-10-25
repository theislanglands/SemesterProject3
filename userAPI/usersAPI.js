const fsLibrary = require('fs');
const usersFile = 'userData.txt';

class User {
    constructor(userId, email, password, fName, lName, subType, admin) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.fName = fName;
        this.lName = lName;
        this.subType = subType;
        this.admin = admin;
    }
    changePassword(newPassword) {
        this.password = newPassword;
    }
}
function createUserFromArr(arr) {
    let user = new User(
        parseInt(arr[0]),
        arr[1],
        arr[2],
        arr[3],
        arr[4],
        parseInt(arr[5]),
        new Boolean(arr[06])
    );
    return user;
}
function prepUserForJSONParse(user) {
    if (user instanceof User) {
        jsonUser = {
            userId: user.userId,
            email: user.email,
            password: user.password,
            fName: user.fName,
            lName: user.lName,
            subType: user.subType,
            admin: user.admin
        };
        return jsonUser;
    }
    return undefined;
}
function generateNextUserId() {
    try {
        let arr = readUsers();
        return arr.length + 1;
    } catch (err) {
        return 1;
    }
}

function changePassword(email, password) {
    let user = getUserFromEmail(email);
    deleteUser(user);
    user.changePassword(password);
    writeUsers(user);
}
function checkCredentials(email, password) {
    let arr = readUsers();
    for (let i = 0; i < arr.length; i++) {
        let lineArr = arr[i].split(';');
        if (lineArr[1] == email) {
            if (lineArr[2] == password) {
                return createUserFromArr(lineArr);
            }
        }
    }
    return 'no users match';
}

function getUserFromEmail(email) {
    let arr = readUsers();
    for (let i = 0; i < arr.length; i++) {
        let lineArr = arr[i].split(';');
        if (lineArr[1] == email) {
            return createUserFromArr(lineArr);
        }
    }
    return false;
}
function getUserByUserId(userId) {
    let arr = readUsers();
    for (let i = 0; i < arr.length; i++) {
        let lineArr = arr[i].split(';');
        if (parseInt(lineArr[0]) == userId) {
            return createUserFromArr(lineArr);
        }
    }
}
function readUsers() {
    var fs = require('fs');
    var text = fs.readFileSync(usersFile).toString('utf-8');
    var textByLine = text.split('\n');
    return textByLine;
}
function writeUsers(user) {
    if (user instanceof User) {
        console.log('asd');
        let string = '';
        string += '\n' + user.userId.toString() + ';';
        string += user.email + ';';
        string += user.password + ';';
        string += user.fName + ';';
        string += user.lName + ';';
        string += user.subType + ';';
        string += user.admin;
        fsLibrary.appendFile(usersFile, string, (e) => {
            if (e) {
                throw e;
            }
        });
    } else {
        console.log('not a user');
    }
}
function deleteUser(user) {
    console.log('asss');
    if (user instanceof User) {
        let arr = readUsers();
        for (let i = 0; i < arr.length; i++) {
            lineArr = arr[i].split(';');
            if (lineArr[1] == user.email) {
                arr.splice(i, 1);
                console.log(lineArr[1]);
            }
        }
        console.log(arr);
        for (let i = 0; i < arr.length; i++) {
            if (i == 0) {
                fsLibrary.writeFile(usersFile, arr[i], (e) => {
                    if (e) {
                        throw e;
                    }
                });
            } else {
                fsLibrary.appendFile(usersFile, '\n' + arr[i], (e) => {
                    if (e) {
                        throw e;
                    }
                });
            }
        }
    }
}
const express = require('express');
const server = express();

server.use(express.static('html'));

server.post('/users/checkCredentials', function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let answer = checkCredentials(email, password);
    if (answer instanceof User) {
        res.end(prepUserForJSONParse(answer));
    } else {
        res.end(JSON.parse(answer));
    }
});

server.post('/users/changePassword', function (req, res) {
    let email = req.body.email;
    if (getUserFromEmail(email) instanceof User) {
        let password = req.body.password;
        let confirmPassword = req.body.confirmPassword;
        if (password == confirmPassword) {
            let bool = changePassword(email, password);
        }
    }
});

var server1 = server.listen(8082, function () {
    var host = server1.address().address;
    var port = server1.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

let markusUser = new User(
    generateNextUserId(),
    'markusmunks@gmail.com',
    'sutmig',
    'markus',
    'munk',
    0,
    true
);
//writeUsers(markusUser);
let markus1User = new User(2, 'markusmunks@gmail.com', 'sutmig', 'markus', 'munk', 0, true);
changePassword('markusmunks@gmail.com', 'øasdfkoäsdf');
