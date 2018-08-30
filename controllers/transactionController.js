var mongoose    = require('mongoose');
const request   = require("request");
var UserWallet  = mongoose.model('UserWallet');

async function transaction(req, res){
    if(req.isAuthenticated()){
        var usrwallt = await getinfo(req.user.email);
        var alltrs = await getalltransaction(usrwallt.wallet_address);
        var ethtrs = await gettransactioneth(usrwallt.wallet_address);
        res.render(`transaction`,{
            email:req.user.email,
            wallet_address: (usrwallt.wallet_address.length>0?usrwallt.wallet_address:''),
            data: alltrs.result,
            dataeth: ethtrs.result,
            title: 'Transactions',
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

function getalltransaction(address){
    const options = {
        url: `http://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=YourApiKeyToken`,
        method: 'GET',
        json: true
    };
    // Return new promise
    return new Promise(function(resolve, reject) {
        // Do async job
        request.get(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        })
    })
}

function gettransactioneth(address){
    const options = {
        url: `http://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=YourApiKeyToken`,
        method: 'GET',
        json: true
    };
    // Return new promise
    return new Promise(function(resolve, reject) {
        // Do async job
        request.get(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        })
    })
}


function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

module.exports = {transaction};