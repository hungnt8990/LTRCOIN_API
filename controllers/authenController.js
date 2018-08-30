const passport = require('passport'),
    passportJWT = require('passport-jwt'),
    extractJwt = passportJWT.ExtractJwt,
    strategyJwt = passportJWT.Strategy,
    config = require('../server/config'),
    mongoose = require('mongoose');
    

var params = {
    secretOrKey: config.secret,
    jwtFromRequest: extractJwt.fromAuthHeaderWithScheme('jwt')
};

module.exports = function() {
    var strategy = new Strategy(params, function(payload, done) {
        var User = mongoose.model('User');
        User.findOne({
            email: payload.email
        }, function(err, user) {
            if (err) throw err;
            if (user) {
                return done(null, {email: user.email});
            }else{
                return done(new Error("Not access"));
            }
        });
    })
    
    passport.use(strategy);
    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function() {
            return passport.authenticate("jwt", cfg.jwtSession);
        }
    };
};