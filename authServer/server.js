const express = require('express')
const app = express()

const path = require('path')

const bodyParser = require('body-parser')

const cookieParser = require('cookie-parser')

const jwt = require('jsonwebtoken')

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'))
})

// Middlewares
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser())

//Listen
app.listen(3300, () => {
    console.log("Connected")
})

const users = [
    {
        username: "Pat",
        password: "hej"
    }
]
let secret = 'tihifnis'
app.post('/auth/login', (req, res) => {
    let username = req.body.username
    const user = users.find(user => user.username == req.body.username)
    
    if (user == null) {
        return res.status(400).send(`Cannot find user with username: ${username}`)
    }

    console.log(user)

    if (user.password == req.body.password) {
        const token = jwt.sign({user: username}, secret, {expiresIn: '5m'})
        var fiveMins = 5 * 60 * 1000;
        res.cookie('authcookie', token, {maxAge: fiveMins, httpOnly: true, secure: false, sameSite: "lax"}).send()
    } else {
        console.log("Invalid password")
    }
})

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname + '/home.html'))
})

function authenticateToken(req, res, next) {
    const authcookie = req.cookies.authcookie
    console.log(authcookie)
    console.log(req.cookies)
    jwt.verify(authcookie, secret, (err, data) => {
        if (err) {
            res.sendStatus(403)
        }
        else if (data.user) {
            req.user = data.user
            next()
        }
    })
}

app.get('/api', authenticateToken, (req, res) => {
    console.log("Cookie checked, success")
    console.log(req.cookies.authcookie)
})