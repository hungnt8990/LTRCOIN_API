var mongoose = require('mongoose');
var User = mongoose.model('User');
const config = require('../server/config');
var UserWallet      = mongoose.model('UserWallet');
var UserToken       = mongoose.model('UserToken');
var ether           = require('../server/util/ether');

async function wallet(req, res){
    if(req.isAuthenticated()){
        var usrwallt = await getinfo(req.user.email);
        var getblleth = await (ether.get_balance_eth(usrwallt.wallet_address))/1000000000000000000;
        var ethtousd = await ether.eth_to_usd();
        var gettokenbalance = await ether.get_balance_token(usrwallt.wallet_address);
        gettokenbalance = parseFloat(gettokenbalance)/1000000000000000000;
        var tktousd = tokentousd(gettokenbalance);
        var onetkousd = tokentousd(1);
        res.render(`wallet`,{
            email:req.user.email,
            wallet_type:usrwallt.wallet_type,
            description:usrwallt.description,
            wallet_address:usrwallt.wallet_address,
            balance: getblleth.toFixed(4),
            exchangeUSD: (getblleth*ethtousd).toFixed(4),
            tokenbalance: parseFloat(gettokenbalance).toFixed(4),
            tokentousd: tktousd.toFixed(4),
            onetkousd: onetkousd,
            title: 'Wallet',
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



module.exports = {wallet};