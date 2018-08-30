const express       = require('express');
const mongoose      = require('mongoose');
const router        = express.Router();
const passport      = require("passport");

//connect mongo
console.log(process.env.DATABASE);
var db = mongoose.connection;
var options = { server:  { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE,options);
mongoose.set('debug', false);
db.on('error', function (err) { console.log(err); });
db.once('open', function (callback) { console.log('Succeeded connected to mongo DB');});

//import model
require('../models/userTokenLogModel');
var userModel           = require('../models/userModel');
var userWalletModel     = require('../models/userWalletModel');
var userTokenModel      = require('../models/userTokenModel');
var adminSendLTRLog     = require('../models/adminSendLTRLogModel');
var adminWalletManager  = require('../models/adminWalletManagerModel');

//import controller
var userController      = require('../controllers/userController');

router.post('/login',userController.validate_login,userController.auth);

router.get("/secret", passport.authenticate('jwt', { session: false }), function(req, res){
    res.json({message: "Success! You can not see this without a token"});
});

module.exports = router;