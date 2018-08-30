var mongoose = require('mongoose');
var User = mongoose.model('User');
const config = require('../server/config');
var UserWallet = mongoose.model('UserWallet');
var UserToken = mongoose.model('UserToken');
var UserTokenLog = mongoose.model('UserTokenLog');
var ether = require('../server/util/ether');

async function profile(req, res){
    if(req.isAuthenticated()){
        var usrwallt = await getinfo(req.user.email);
        res.render(`buyico`,{
            email:req.user.email,
            wallet_address: (usrwallt.wallet_address.length>0?usrwallt.wallet_address:''),
            i18n: res
        });
    }else{
        res.render('sign-in');
    }
}

module.exports = {profile};