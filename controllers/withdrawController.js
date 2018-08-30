var speakeasy       = require('speakeasy');
var mongoose = require('mongoose');
var User = mongoose.model('User');
const config = require('../server/config');
var UserWallet      = mongoose.model('UserWallet');
var UserToken       = mongoose.model('UserToken');
var ether           = require('../server/util/ether');

// var QRCode = require('qrcode');

// async function CreateF2A(){
//     await User.findOne({
//         email: req.user.email
//     }, function(err, user) {
//         if (err) throw err;
//         if(user.f2a == ''){
//             var secret = speakeasy.generateSecret({length: 20});
//             var urlimg = f2aToQrcode(secret.otpauth_url);
//             res.json({
//                 result: 'OK',
//                 secret: secret,
//                 imgurl: urlimg
//             });
//         }else{
//             var urlimg = f2aToQrcode(user.secret.otpauth_url);
//             res.json({
//                 result: 'IsOn',
//                 secret: user.secret,
//                 imgurl: urlimg
//             });
//         }
//     })
// }

// async function f2aToQrcode(secret){
//     QRCode.toDataURL(secret, function(err, image_data) {
//         return image_data;
//     });
// }

async function withdraw (req,res){
    if(req.isAuthenticated()){
        var _email = req.user.email
        var usrwallt = await getinfo(_email);
        var userinfo = await getUserinfo(req.user.email);
        if(userinfo.cmnd_front_confimed == false || userinfo.cmnd_back_confimed == false || userinfo.cmnd_self_confimed == false){
            res.redirect('/profile');
        }else{
            var getblleth = await (ether.get_balance_eth(usrwallt.wallet_address))/1000000000000000000; // lấy eth
            var get_gasprice = await ether.GetGasPrice(); // tính gasprice
            var fee_withdraw = (51191 * parseFloat(get_gasprice)) / 1000000000000000000; // tính phí rút
            var d = new Date()
            var ethtousd = await ether.eth_to_usd();
            var gettokenbalance = await ether.get_balance_token(usrwallt.wallet_address);
            gettokenbalance = parseFloat(gettokenbalance)/1000000000000000000;
            var tktousd = tokentousd(gettokenbalance);
            res.render(`withdraw`,{
                email:_email,
                wallet_type:usrwallt.wallet_type,
                description:usrwallt.description,
                wallet_address:usrwallt.wallet_address,
                balanceeth: getblleth.toFixed(4),
                exchangeUSD: (getblleth*ethtousd).toFixed(4),
                tokenbalance: parseFloat(gettokenbalance).toFixed(4),
                tokentousd: parseFloat(tktousd).toFixed(4),
                title: 'Withdraw',
                i18n: res
            });
        }
    }else{
        res.render('sign-in',{message: req.flash('loginMessage'),ref:''});
    }
};

async function getinfo(_email){
    var info = await UserWallet.findOne({email:_email});
    return info;
}

async function getUserinfo(_email){
    var info = await User.findOne({email:_email});
    return info;
}

function tokentousd(numoftoken){
    var d = new Date();
        var month = d.getMonth() + 1;
        var priceofmomth;
        switch(month) {
            case 8:
                priceofmomth = 0.0005;
                break;
            case 9:
                priceofmomth = 0.0006;
                break;
            case 10:
                priceofmomth = 0.0007;
                break;
            case 11:
                priceofmomth = 0.0008;
                break;
            case 12:
                priceofmomth = 0.0009;
                break;
            case 1:
                priceofmomth = 0.00095;
                break;
            default:
                priceofmomth = 0.0005;
        }
        result = parseFloat(numoftoken) * parseFloat(priceofmomth);
        return result;
}


module.exports = {withdraw}