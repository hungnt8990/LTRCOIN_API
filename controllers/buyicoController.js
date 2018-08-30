var mongoose = require('mongoose');
var User = mongoose.model('User');
const config = require('../server/config');
var UserWallet = mongoose.model('UserWallet');
var UserToken = mongoose.model('UserToken');
var UserTokenLog = mongoose.model('UserTokenLog');
var ether = require('../server/util/ether');
var QRCode      = require('qrcode');

async function buyico(req, res){
    if(req.isAuthenticated()){
        var usrwallt = await getinfo(req.user.email);
        var userinfo = await getUserinfo(req.user.email);
        var getblleth = await (ether.get_balance_eth(usrwallt.wallet_address))/1000000000000000000;
        var ethtousd = await ether.eth_to_usd();
        var gettokenbalance = await ether.get_balance_token(usrwallt.wallet_address);
        gettokenbalance = parseFloat(gettokenbalance)/1000000000000000000;
        res.render(`buyico`,{
            email:req.user.email,
            wallet_address: (usrwallt.wallet_address.length>0?usrwallt.wallet_address:''),
            tokenbalance: parseFloat(gettokenbalance).toFixed(4),
            exchangeUSD: (getblleth*ethtousd).toFixed(4),
            balanceeth: getblleth.toFixed(4),
            cmnd_front_confimed: userinfo.cmnd_front_confimed,
            cmnd_back_confimed: userinfo.cmnd_back_confimed,
            cmnd_self_confimed: userinfo.cmnd_self_confimed,
            title: 'Buy Token',
            i18n: res
        });
    }else{
        res.render('sign-in',{message: req.flash('loginMessage'),ref:''});
    }
}

async function getinfo(_email){
    var info = await UserWallet.findOne({email:_email});
    return info;
}

async function getUserinfo(_email){
    var info = await User.findOne({email:_email});
    return info;
}

const numberWithCommas = (x) => {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

module.exports = {buyico};