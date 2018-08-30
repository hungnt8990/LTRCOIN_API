const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
var ether = require('../server/util/ether');
var bcrypt = require('bcrypt');
const config = require('../server/config');
var UserWallet = mongoose.model('UserWallet');
var UserToken = mongoose.model('UserToken');
var UserTokenLog = mongoose.model('UserTokenLog');

// API Tạo ví
var create_wallet_ether = (req, res) => {
    var token = req.body.token;
    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                req.decoded = decoded;
                var email = decoded.email;
                ether.create_ether_account(email, (data) => {
                    res.json(data);
                })
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
}

// API Lấy thông tin ví
var getwallet = (req, res) => {
    var token = req.param('token');
    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                req.decoded = decoded;
                var email = decoded.email;
                UserWallet.findOne({ email: email }, function (err, result) {
                    if (err) {
                        res.json(err);
                    } else {
                        var arr = [];
                        arr.push(result);
                        res.json([{
                            wallet_type: arr[0].wallet_type,
                            description: arr[0].description,
                            wallet_address: arr[0].wallet_address,
                        }]);
                    }
                });
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
};

// API Chuyển tiền LTR
async function buytoken(req, res) {
    if (req.isAuthenticated()) {
        if(!req.body.numofeth){return res.json({result: false,notice:'Please input value'});}
        var numofeth = req.body.numofeth;

        // check if number
        if(!IsNumeric(numofeth)){return res.json({result: false,notice:'Please check value is correct'});}

        // min value eth to buy
        //if(config.min_value_eth_tobuy < parseFloat(req.body.numofeth)){return res.json({result: false,notice:`You have to buy a minimum of ${config.min_value_eth_tobuy} ETH`});}

        var _email = req.user.email;
        var usrwallt = await getinfo(_email);
        var getblleth = await (ether.get_balance_eth(usrwallt.wallet_address)) / 1000000000000000000;
        var d = new Date();
        
        var get_gasprice = await ether.GetGasPrice(); // tính gasprice
        var fee_withdraw = (53000 * (parseFloat(get_gasprice)+10000000000)) / 1000000000000000000; // phí quy ra ETH

        var cal_token_subfee = await ether.cal_token_subfee(numofeth);
        if (parseFloat(fee_withdraw) > parseFloat(getblleth)) {
            return res.json({result: false,notice:`Amount of ETH fee is not enough , you need ${fee_withdraw} ETH to transaction`});
        }else if(parseFloat(cal_token_subfee) <= 0){
            return res.json({result: false,notice:`Please buy more and more, the fee is so plethoric`});
        }
        else {
            ether.transaction_ether(_email, config.WalletFreze, numofeth, (dataETH) => {
                if (dataETH) {
                    if(dataETH.result == 'fail'){
                        return res.json({result: false,notice:`Amount of ETH fee is not enough , you need ${fee_withdraw} ETH to transaction`});
                    }else{
                        ether.transaction_LTR(_email, numofeth, (dataLTR) => {
                            if(dataLTR){
                                var buytokenlog = new UserTokenLog({
                                    email: _email,
                                    value_ETH: numofeth,
                                    value_LTR: dataLTR.valueltr,
                                    txhash_ETH: dataETH.hash,
                                    txhash_LTR: dataLTR.hash,
                                    create_at: new Date()
                                });
                                buytokenlog.save(function (err) {
                                    if (err) throw err;
                                    else{
                                        var User = mongoose.model('User');
                                        if(req.user.ref_id != ''){
                                            var  value_bonus = dataLTR.valueltr/100*config.bonus;
                                            User.findOneAndUpdate({_id:req.user.ref_id}, { $inc: { ref_value: Math.round(value_bonus) } }, {upsert:false},function(err, response) {
                                                return res.json({result: true,notice:dataLTR.hash});
                                            })
                                        }else{
                                            return res.json({result: true,notice:dataLTR.hash});
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    } else {
        res.render('sign-in');
    }
};

async function withdraw(req, res) {
    if (req.isAuthenticated()) {
        var _address,_value,_type;
        if(!req.body.value){
            return res.json({result: false,notice:'Please input value'});
        }else if(!req.body.address){
            return res.json({result: false,notice:'Please input address'});
        }else if(_type){
            return res.json({result: false,notice:'Please choose type to withdraw'});
        }

        _address = req.body.address;
        _value = req.body.value;
        _type = req.body.type;
        var _email = req.user.email;
        if(!IsNumeric(_value)){
            return res.json({result: false,notice:'Please check value is correct'});
        }
        var validaddress = await ether.CheckvalidAddress(_address);
        if(!validaddress){
            return res.json({result: false,notice:'Please check valid address'});
        }
        var info = await getinfo(_email);
        if(_type == 'ltr'){
            var data = await ether.get_balance_token(info.wallet_address);
            data = parseFloat(data) / 1000000000000000000;
            if(parseFloat(_value) >= parseFloat(data)){
                return res.json({result:false,notice:'Balance not enough to transaction'});
            }
        }else if(_type == 'eth'){
            var data = await ether.get_balance_eth(info.wallet_address);
            data = parseFloat(data) / 1000000000000000000;
            if(parseFloat(_value) >= parseFloat(data)){
                return res.json({result:false,notice:'Balance not enough to transaction'});
            }
        }

        // Lấy balance ETH
        var usrwallt = await getinfo(_email); // Lấy ví từ email
        var getblleth = await (ether.get_balance_eth(usrwallt.wallet_address)) / 1000000000000000000; // lấy eth

        //Tính phí
        var get_gasprice = await ether.GetGasPrice(); // tính gasprice
        var fee_withdraw = (53000 * (parseFloat(get_gasprice)+10000000000)) / 1000000000000000000; // phí quy ra ETH

        var d = new Date();

        if (parseFloat(fee_withdraw) > parseFloat(getblleth)) {
            return res.json({result:false,notice:`Amount of ETH fee is not enough , you need ${fee_withdraw} ETH to transaction`});
        } else {
            if (_type == 'ltr') { // RÚT LTR TOKEN
                ether.withdraw_LTR(_email, _address, _value, (txHashLTR) => {
                    if (txHashLTR) {
                        if(txHashLTR.result == 'ok'){
                            return res.json({result:true,notice:txHashLTR.hash});
                        }else if(txHashLTR.result == 'fail'){
                            return res.json({result:false,notice:`Amount of ETH fee is not enough , you need ${fee_withdraw} ETH to transaction`});
                        }
                    }
                });
            } else if (_type == 'eth') { // Rút ETH
                ether.transaction_ether(_email, _address, _value, (txHashETH) => {
                    if (txHashETH) {
                        if(txHashETH.result == 'ok'){
                            return res.json({result:true,notice:txHashETH.hash});
                        }else if(txHashETH.result == 'fail'){
                            return res.json({result:false,notice:`Amount of ETH fee is not enough , you need ${fee_withdraw} ETH to transaction`});
                        }
                    }
                });
            }
        }
    } else {
        res.render('sign-in', { message: req.flash('loginMessage') });
    }
};

async function getinfo(_email) {
    var info = await UserWallet.findOne({ email: _email });
    return info;
}

// API Chuyển tiền LTR
function sendLTR(req, res) {
    if (req.isAuthenticated()) {
        var token = req.body.token;
        var numofeth = req.body.numofeth;
        if (token) {
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    req.decoded = decoded;
                    var email = decoded.email;
                    ether.transaction_LTR(email, numofeth, (data) => {
                        res.json(data);
                    });
                }
            });
        } else {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    } else {
        res.render('sign-in', { message: req.flash('loginMessage') });
    }
};

// API Chuyển tiền LTR
function admin_send_LTR(req, res) {
    if (req.isAuthenticated()) {
        var addressReceive = req.body.addressReceive;
        var numofeth = req.body.numofeth;
        ether.admin_send_LTR(addressReceive, numofeth, (data) => {
            res.json(data);
        });
    } else {
        res.render('sign-in', { message: req.flash('loginMessage') });
    }
};

// API Lấy thông tin token
var get_token_wallet = (req, res) => {
    if (req.isAuthenticated()) {
        var token = req.param('token');
        if (token) {
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    req.decoded = decoded;
                    var email = decoded.email;
                    UserToken.findOne({ email: email }, function (err, result) {
                        if (err) throw err;
                        res.json(result);
                    });
                }
            });
        } else {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    } else {
        res.render('sign-in', { message: req.flash('loginMessage') });
    }
};


// API Lấy balance
var get_balance_eth = (req, res) => {
    if (req.isAuthenticated()) {
        var address = req.param('address');
        var token = req.param('token');
        if (token) {
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    req.decoded = decoded;
                    ether.get_balance_eth(address, (data) => {
                        (data) ? res.json(data) : res.json(0);
                    });
                }
            });
        } else {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    } else {
        res.render('sign-in', { message: req.flash('loginMessage') });
    }
};

// API Lấy balance
async function get_balance_token(req, res) {
    if (req.isAuthenticated()) {
        var address = req.param('address');
        var data = await ether.get_balance_token(address);
        (data) ? res.json(data) : res.json(0);
    } else {
        res.render('sign-in', { message: req.flash('loginMessage') });
    }
};

var get_info_transaction = (req, res) => {
    if (req.isAuthenticated()) {
        var transactionhash = req.param('transactionhash');
        ether.gettransaction_info(transactionhash, (data) => {
            res.json(data);
        });
        // var transactionhash = req.get('transactionhash');
        // ether.gettransaction_info(transactionhash,(data)=>{
        //     res.json(data);
        // });
    } else {
        res.render('sign-in', { message: req.flash('loginMessage') });
    }
}

async function eth_to_usd(req, res) {
    var val = await ether.eth_to_usd();
    res.json(val);
}

async function cal_token_subfee(req, res) {
    if (req.isAuthenticated()) {
        var eth = req.param('eth');
        var val = await ether.cal_token_subfee(eth);
        res.json(val);
    } else {
        res.render('sign-in', { message: req.flash('loginMessage') });
    }
}

async function getTransactionReceipt(req, res) {
    if (req.isAuthenticated()) {
        var txhash = req.param('txhash');
        ether.getTransactionReceipt(txhash);
        res.json('ok');
    } else {
        res.render('sign-in', { message: req.flash('loginMessage') });
    }
}

function IsNumeric(input){
    var RE = /^-{0,1}\d*\.{0,1}\d+$/;
    return (RE.test(input));
}

async function get_top_bonus(req,res){
    var User = mongoose.model('User');
    User.find().sort({$ref_value:1}).limit(10);
}

async function get_gasprice(req, res){
    var get_gasprice = await ether.GetGasPrice(); // tính gasprice
    res.json(get_gasprice);
}

async function get_sum_LTR(req,res){
    var User = mongoose.model('User');
    var sum_ref = await User.aggregate([{$group:{_id : null,count:{$sum:"$ref_value"}}}]);
    var sum_ltr = await UserTokenLog.aggregate([{$group:{_id : null,count:{$sum:"$value_LTR"}}}]);
    var sum_total = parseFloat(sum_ref[0].count) + parseFloat((sum_ltr.length>0)?sum_ltr[0].count:0);
    res.json(sum_total);
}

async function get_sum_ETH_Total_Email_Buy_LTR(req,res){
    var sum_eth = await UserTokenLog.aggregate([{$group:{_id : null,count:{$sum:"$value_ETH"}}}]);    
    var sum_email= await UserTokenLog.aggregate( [
        { $group: { _id: { email:  "$email" }, count: { $sum: 1 } } }
     ] )
    var sum_email_buy_LTR =  parseFloat((sum_email.length>0)?sum_email.length:0);
    var sum_total = parseFloat((sum_eth.length>0)?sum_eth[0].count:0);
    res.json({
        TotalETH:sum_total,
        TotalEmailBuyLTR:sum_email_buy_LTR
    });
}

async function test(req,res){
    await ether.test('0x8347D36816CB0E92a71086A8e640Deb950FcB7Bc',1234.123,'worldcup 2018',(data) =>{
        res.json(data);
    });
}

function GetNextSessionWallet(req, res) {
    ether.GetNextSessionWallet((data)=>res.json(data));
}

module.exports = {
    create_wallet_ether,
    getwallet,
    get_token_wallet,
    get_balance_eth,
    get_balance_token,
    buytoken,
    get_info_transaction,
    eth_to_usd,
    cal_token_subfee,
    sendLTR,
    getTransactionReceipt,
    withdraw,
    admin_send_LTR,
    get_gasprice,
    get_sum_LTR,
    get_sum_ETH_Total_Email_Buy_LTR,
    GetNextSessionWallet,
    test
};