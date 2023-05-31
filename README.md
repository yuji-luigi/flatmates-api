clone this project
remove .git file to start new git repository

#### set package.json

name:
description
...ect...

#### Step1 .env settings

..................example...........................

```
NODE_ENV=dev
PORT_DEV=4444 required
PORT_PROD=80

JWT_SECRET=remember-to-generate the secret!!!
JWT_EXPIRATION_SECONDS=86400

MONGO_URI_DEV=mongodb://localhost:27000/<database name> required
MONGO_URI_PROD=mongodb://user:<password>@mongo:27017/

DEV_COOKIE_DOMAIN=http://localhost:4444 **remember to set as same as where api is running at**
PROD_COOKIE_DOMAIN=http://localhost:80

CRON_SCHEDULE_PROD="0 8 \* \* *"
CRON_SCHEDULE_DEV="*/3 \* \* \* \* \*"
```

.........................................

### enable login me function

/middleware/auth.js

```javascript
### remove this
exports.isLoggedIn = (roles = USER_ROLES) => (req, res, next) => {
    // passport.authenticate(
    //     'jwt',
    //     { session: false },
    //     handleJWT(req, res, next, roles),
    // )(req, res, next);
    next();
};

### use this code
/*
!!!THIS IS THE CORRECT ROUTE FOR ME ROUTE!!!
exports.isLoggedIn = (roles = User.roles) => (req, res, next) => passport.authenticate(
    'jwt',
    { session: false },
    handleJWT(req, res, next, roles),
)(req, res, next); */
```
# flatmate-api
# flatmate-api
# flatmate-api
