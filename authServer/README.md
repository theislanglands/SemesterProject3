# authServer

## API description

The authServer API is written with the Expressjs lib with Node.

It routes and handles requests and returns responses when specified requests in the API with a path are called.

For testing purposes, the [server.js](server.js) file uses an array to store and authenticate users.

### Login

Sending a POST request

```
Content-type: application/json

username: 'Pat'
password: 'hej'
```

to the path `localhost:3300/auth/login` will return a response that stores two cookies on the client, called `authcookie` and `refreshcookie`. These cookies store the username. The authcookie expires after 5 minutes, while the refreshcookie expires after a week.

A simple page called [index.html](index.html) submits a form using POST for testing purposes

```
<!DOCTYPE html>
<body>
    <form action = "/auth/login" method="POST">
        <div>
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required>
        </div>
        <div>
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
        </div>
        <button type="submit">Submit</button>
    </form>
</body>
```

GET requests to the path `/` will serve the `index.html` file to the client

```javascript
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
```

### Authentication

You can test authentication by getting a set of cookies from the above API call, and then use a GET request to the path `/`. This route has middleware, which is the function `authenticateToken`. Authenticate token uses the jsonwebtoken library to verify signed tokens, and then uses the callback-function next() upon successful verification to continue the api-call. The API then simply runs: `console.log('Cookie checked, success')`

This can also tested in the browser by visiting the root path of the container, logging in with the above-mentioned credentials and navigating to `localhost:3300/api`.

```javascript
// Token Authentication
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

// API router
app.get('/api', authenticateToken, (req, res) => {
    console.log('Cookie checked, success');
});
```

### Refreshing tokens

For testing purposes, the server stores refresh tokens in an array.

GET requests made to the path `auth/refresh` in the browser will automatically pass the clients tokens, verify the refresh token using the function `authenticateRefreshToken` and replace both the access token and refresh token in the client with a fresh pair. After 5 mins the accesscookie will expire, meaning the path `/api` can no longer be accessed. However, the refreshcookie lasts a week, meaning an api call to `/auth/refresh` can still be made, this renews your access.

```javascript
// Authenticating refresh tokens
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

// GET requests to the path /auth/refresh will be routed here, call the above function, and if verified sucessfully will return a new token-pair
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
```
