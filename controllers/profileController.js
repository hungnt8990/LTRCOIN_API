var mongoose = require('mongoose');
var User = mongoose.model('User');
const config = require('../server/config');
var UserWallet = mongoose.model('UserWallet');
var UserToken = mongoose.model('UserToken');
var UserTokenLog = mongoose.model('UserTokenLog');
var ether = require('../server/util/ether');

async function profile(req, res){
    if(req.isAuthenticated()){
        var _email = req.user.email;
        var count_ref = await countref(req.user._id);
        var sum_ref = await sumref(_email);
        var usrwallt = await getinfo(_email);
        var getblleth = await (ether.get_balance_eth(usrwallt.wallet_address))/1000000000000000000; // lấy eth
        var get_gasprice = await ether.GetGasPrice(); // tính gasprice
        var fee_withdraw = (51191 * parseFloat(get_gasprice)) / 1000000000000000000; // tính phí rút
        var d = new Date()
        var usrwallt = await getinfo(_email);
        var getblleth = await (ether.get_balance_eth(usrwallt.wallet_address))/1000000000000000000;
        var ethtousd = await ether.eth_to_usd();
        var gettokenbalance = await ether.get_balance_token(usrwallt.wallet_address);
        gettokenbalance = parseFloat(gettokenbalance)/1000000000000000000;
        var tktousd = tokentousd(gettokenbalance);
        var onetktousd = tokentousd(1);
        res.render(`profile`,{
            email:_email,
            countref: count_ref,
            sumref: req.user.ref_value,
            wallet_type:usrwallt.wallet_type,
            description:usrwallt.description,
            wallet_address:usrwallt.wallet_address,
            balanceeth: getblleth.toFixed(4),
            exchangeUSD: (getblleth*ethtousd).toFixed(4),
            tokenbalance: parseFloat(gettokenbalance).toFixed(4),
            tokentousd: tktousd.toFixed(4),
            onetktousd: onetktousd,
            id:req.user._id,
            firstname:req.user.firstname,
            lastname:req.user.lastname,
            cmnd_front:req.user.cmnd_front,
            cmnd_front_confimed: req.user.cmnd_front_confimed,
            cmnd_back:req.user.cmnd_back,
            cmnd_back_confimed: req.user.cmnd_back_confimed,
            cmnd_self:  req.user.cmnd_self,
            cmnd_self_confimed: req.user.cmnd_self_confimed,
            reason_not_confirm: req.user.reason_not_confirm,
            f2a: req.user.f2a,
            title: 'Profile',
            i18n: res,
            messageupload: req.flash('messageupload'),
            messageprofile: req.flash('messageprofile'),
            messagef2a: req.flash('messagef2a')
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

async function countref(_id){
    var User = mongoose.model('User');
    var count_ref = await User.find({ref_id:_id}).count();
    return count_ref;
}

async function sumref(_email){
    var User = mongoose.model('User');
    var sum_ref = await User.aggregate([{$group:{_id : null,sum:{$sum:"$ref_value"}}}]);
    return sum_ref.sum;
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

module.exports = {profile};