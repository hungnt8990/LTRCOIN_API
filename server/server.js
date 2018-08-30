require("dotenv").config();
const _                 = require("lodash");
const http              = require('http');
const subdomain         = require('express-subdomain');
const httpProxy         = require('http-proxy');
const express           = require("express");
const bodyParser        = require("body-parser");
const jwt               = require('jsonwebtoken');
const router            = require('../router/router');
const passport          = require("passport");
const passportJWT       = require("passport-jwt");
const ExtractJwt        = passportJWT.ExtractJwt;
const JwtStrategy       = passportJWT.Strategy;
const mongoose          = require('mongoose');
const expressValidator  = require("express-validator");
var User                = mongoose.model('User');

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = process.env.SECRET;

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
    User.findOne({
        _id: jwt_payload._id
    }, function(err, user) {
        if (user) {
            next(null, user);
          } else {
            next(null, false);
          }
    })
});

passport.use(strategy);

var app = express();
// var server = require('diet');
// var app = server()
app.use(passport.initialize());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(expressValidator());


app.use('/api', router);
// var proxy_api = new httpProxy.createProxyServer({
//   target: {
//       host: 'localhost',
//       port: 8081
//   }
// });
const hostname = 'api.ltrcoin.com';
const port = 3000;
const server = http.createServer(app);

server.listen(port, () => {
	console.log(`server listening on host: ${hostname} port: ${port}`);
});

// app.listen('https://api.ltrcoin.com/', function() {
//   console.log("Express running");
// });
