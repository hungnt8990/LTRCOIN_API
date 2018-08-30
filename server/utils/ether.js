const http          = require("https");
const request       = require("request");
const fs            = require('fs');
const mongoose      = require('mongoose');
var UserWallet      = mongoose.model('UserWallet');
var UserToken       = mongoose.model('UserToken');
var UserTokenLog    = mongoose.model('UserTokenLog');
var adminWalletManager = mongoose.model('adminWalletManager');
const config        = require('../config');
var Tx              = require('ethereumjs-tx');

var url = "https://mainnet.infura.io/MDw5iQnDYKeDKdoBB0Fr";
var Accounts = require('web3-eth-accounts');
var accounts = new Accounts(url);

var Personal = require('web3-eth-personal');
var personal = new Personal(Personal.givenProvider || url);

var Eth = require('web3-eth');
var eth = new Eth(Eth.givenProvider || url);

var Web3 = require('web3');
var web3 = new Web3(Web3.givenProvider || url);

// Tạo ví
function create_ether_account(_email,callback){
    UserWallet.findOne({email:_email,wallet_type:"ETH"},function(error,result) {
        if (error) return;
        if(result != null){
            //var privatekey = web3.eth.accounts.decrypt(JSON.parse(result.wallet_privatekey), config.passphrase);
            callback(true);
        }else{
            var create_address = web3.eth.accounts.create(config.passphrase);
            if(create_address){
                var uw = new UserWallet({ 
                                            email:_email,
                                            wallet_type:"ETH",
                                            description :"Ethereum",
                                            wallet_address:create_address.address,
                                            wallet_privatekey: JSON.stringify(web3.eth.accounts.encrypt(create_address.privateKey, config.passphrase)),
                                            create_at:new Date()
                                        });
                    uw.save(function(err) {
                    if (err) throw err;
                    callback(true);
                });
            }else{
                callback(false);
            }
        }
    });
}

// Tạo ví để chuyển token
async function create_ether_account_for_transaction(callback){
    var create_address = await web3.eth.accounts.create(config.passphrase);
    if(create_address){
        var md = new adminWalletManager({ 
                                    address:create_address.address,
                                    Type:"ETH",
                                    privateKey:create_address.privateKey,
                                    create_at:new Date(),
                                    session: false,
                                    create_at:new Date()
                                });
        md.save(function(err) {
            if (err) throw err;
            callback(true);
        });
    }else{
        callback(false);
    }
}

// Chuyển tiền
async function transaction_ether(_email,_to,_value,callback){
    var obj_email = await privateKey_from_address(_email); // lấy address và privatekey từ email
    var _address = obj_email.address; // địa chỉ người gửi
    await unlock_account(_address);
    var _privateKey = await obj_email.privateKey.substring(2);//privatekey bỏ 0x
    var txnCount = await web3.eth.getTransactionCount(_address);//lấy số nonce
    var privateKey = await new Buffer(_privateKey, 'hex');//buffer privatekey
    var receivingAddr = _to;//địa chỉ người nhận
    var txValue = await web3.utils.numberToHex(web3.utils.toWei(_value, 'ether'));//convert wei và hex số lượng eth cần chuyển
    var txData = await web3.utils.asciiToHex('LTR Token');// text ghi chú khi chuyển sang hex.
    var gspr = await web3.eth.getGasPrice();
    gspr = await (parseFloat(gspr) + 10000000000); // cộng 10 Gwei vào gasprice
    var rawTx = {
        nonce: web3.utils.toHex(txnCount),// Nonce is the times the address has transacted, should always be higher than the last nonce 0x0#
        gasPrice: web3.utils.toHex(gspr), // 10 Gwei
        gasLimit: web3.utils.toHex('22000'), // 22000 gas
        to: receivingAddr, // địa chỉ nhận
        value: txValue, // số lượng chuyển
        data: txData // text ghi chú khi chuyển.
    }
    var tx = new Tx(rawTx);
    await tx.sign(privateKey);
    var serializedTx = await tx.serialize();
    await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')) // Broadcast the transaction to the network
    .on('transactionHash', function(hash){
        var callBackString = {};
        callBackString.result = 'ok';
        callBackString.hash = hash;
        callback(callBackString);
    })
    .on('confirmation', function(confirmationNumber, receipt){ 
            //console.log('so 2 : ' + confirmationNumber);
            //console.log('so 3 : ' + JSON.stringify(receipt));
    })
    .on('receipt', function(receipt){
        //console.log('so 4 : ' + receipt)
    }) // When a receipt is issued, log it to the console
    .on('error', function(error){
        var callBackString = {};
        callBackString.result = 'fail';
        callBackString.error = error;
        callback(callBackString);
    });
}

async function transaction_LTR(_email,_value,callback){
    //người gửi
    var infowalletsend = await GetNextSessionWallet();
    var addressSender = infowalletsend.address; //địa chỉ người gửi
    var privatekeySender = infowalletsend.privateKey; //privatekey người gửi
    privatekeySender = await privatekeySender.substring(2);
    //người nhận
    var obj_email = await privateKey_from_address(_email); // lấy address và privatekey từ email
    var _address = obj_email.address; // địa chỉ người nhận
    var receiadress = await _address.substring(2);

    var txnCount = await web3.eth.getTransactionCount(addressSender);//lấy số nonce
    var privateKey = await new Buffer(privatekeySender, 'hex');//buffer privatekey
    var receivingAddr = config.SmartContract; //địa chỉ người nhận la dia chi Smartcontract
    var txValue = "0x00";// 0x00 Gui 0 ETH
    
    var gspr = await web3.eth.getGasPrice(); // lấy gas price
    gspr = await (parseFloat(gspr) + 10000000000); // cộng 10 Gwei vào gasprice
    var tokenandfee = await cal_token_subfee(_value); //lấy token từ số eth đã trừ phí
    var tokensave = tokenandfee;
    if(!tokenandfee.toString().includes(".")){
        var len = 0;
        while(len < 18){
            tokenandfee = tokenandfee + '0';
            len++;
        }
    }else{
        var res = tokenandfee.toString().split(".");
        var tokenandfee_1 = res[0];
        var tokenandfee_2 = res[1];
        var tokenandfee_12 = tokenandfee_1 + tokenandfee_2;
        var len_tokenandfee_2 = tokenandfee_2.length;
        while(len_tokenandfee_2 < 18){
            tokenandfee_12 = tokenandfee_12 + '0';
            len_tokenandfee_2++;
        }
        tokenandfee = tokenandfee_12;
    }
    var value = await web3.utils.toHex(tokenandfee).substring(2); // chuyển token sang hex
    while(value.length < 64){
        value = '0' + value;
    };
    var txData = "0xa9059cbb000000000000000000000000" +  receiadress + value;
    var rawTx = {
        nonce: web3.utils.toHex(txnCount),// Nonce is the times the address has transacted, should always be higher than the last nonce 0x0#
        gasPrice: web3.utils.toHex(gspr),
        gasLimit: web3.utils.toHex('53000'), // 53000 gas
        to: receivingAddr, // địa chỉ nhận
        value: txValue, // số lượng chuyển
        data: txData, // text ghi chú khi chuyển.
    }
    var tx = new Tx(rawTx);
    await tx.sign(privateKey);
    var serializedTx = await tx.serialize();
    await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')) // Broadcast the transaction to the network
    .on('transactionHash', function(hash){
        var callBackString = {};
        callBackString.valueltr = tokensave;
        callBackString.hash = hash;
        callback(callBackString);
    })
}

async function withdraw_LTR(_email,_addressReceive,_value,callback){
    //địa chỉ gửi gửi
    var obj_email = await privateKey_from_address(_email);
    var addressSender = obj_email.address; //địa chỉ người gửi
    var privatekeySender = obj_email.privateKey; //privatekey người gửi
        privatekeySender = await privatekeySender.substring(2);
    
    //unlock tài khoản nếu chưa unlock
    await unlock_account(addressSender);

    //người nhận
    var receiadress = await _addressReceive.substring(2);

    var txnCount = await web3.eth.getTransactionCount(addressSender);//lấy số nonce
    var privateKey = await new Buffer(privatekeySender, 'hex');//buffer privatekey
    var receivingAddr = config.SmartContract; //địa chỉ người nhận la dia chi Smartcontract
    var txValue = "0x00";// 0x00 Gui 0 ETH
    var gspr = await web3.eth.getGasPrice(); // lấy gas price
        gspr = await (parseFloat(gspr) + 10000000000); // cộng 10 Gwei vào gasprice
    if(!_value.toString().includes(".")){
        var len = 0;
        while(len < 18){
            _value = _value + '0';
            len++;
        }
    }else{
        var res = _value.toString().split(".");
        var tokenandfee_1 = res[0];
        var tokenandfee_2 = res[1];
        var tokenandfee_12 = tokenandfee_1 + tokenandfee_2;
        var len_tokenandfee_2 = tokenandfee_2.length;
        while(len_tokenandfee_2 < 18){
            tokenandfee_12 = tokenandfee_12 + '0';
            len_tokenandfee_2++;
        }
        _value = tokenandfee_12;
    }
    var value = await web3.utils.toHex(_value).substring(2); // chuyển token sang hex
    while(value.length < 64){
        value = '0' + value;
    };
    var txData = "0xa9059cbb000000000000000000000000" +  receiadress + value;
    var rawTx = {
        nonce: web3.utils.toHex(txnCount),// Nonce is the times the address has transacted, should always be higher than the last nonce 0x0#
        gasPrice: web3.utils.toHex(gspr),
        gasLimit: web3.utils.toHex('53000'), // 51191 gas
        to: receivingAddr, // địa chỉ nhận
        value: txValue, // số lượng chuyển
        data: txData, // text ghi chú khi chuyển.
    }
    var tx = new Tx(rawTx);
    await tx.sign(privateKey);
    var serializedTx = await tx.serialize();
    await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')) // Broadcast the transaction to the network
    .on('transactionHash', function(hash){
        var callBackString = {};
        callBackString.result = 'ok';
        callBackString.hash = hash;
        callback(callBackString);
    })
    .on('error', function(error){
        var callBackString = {};
        callBackString.result = 'fail';
        callBackString.error = error;
        callback(callBackString);
    });
}

async function admin_send_LTR(_addressReceive,_value,callback){
    //địa chỉ gửi gửi
    var infowalletsend = await GetNextSessionWallet();
    var addressSender = infowalletsend.address; //địa chỉ người nhận
    var privatekeySender = infowalletsend.privateKey; //privatekey người nhận
    privatekeySender = await privatekeySender.substring(2);
    
    //unlock tài khoản nếu chưa unlock
    await unlock_account(addressSender);

    //người nhận
    var receiadress = await _addressReceive.substring(2);

    var txnCount = await web3.eth.getTransactionCount(addressSender);//lấy số nonce
    var privateKey = await new Buffer(privatekeySender, 'hex');//buffer privatekey
    var receivingAddr = config.SmartContract; //địa chỉ người nhận la dia chi Smartcontract
    var txValue = "0x00";// 0x00 Gui 0 ETH
    var gspr = await web3.eth.getGasPrice(); // lấy gas price
        gspr = await (parseFloat(gspr) + 10000000000); // cộng 1 Gwei vào gasprice
    if(!_value.toString().includes(".")){
        var len = 0;
        while(len < 18){
            _value = _value + '0';
            len++;
        }
    }else{
        var res = _value.toString().split(".");
        var tokenandfee_1 = res[0];
        var tokenandfee_2 = res[1];
        var tokenandfee_12 = tokenandfee_1 + tokenandfee_2;
        var len_tokenandfee_2 = tokenandfee_2.length;
        while(len_tokenandfee_2 < 18){
            tokenandfee_12 = tokenandfee_12 + '0';
            len_tokenandfee_2++;
        }
        _value = tokenandfee_12;
    }
    var value = await web3.utils.toHex(_value).substring(2); // chuyển token sang hex
    while(value.length < 64){
        value = '0' + value;
    };
    var txData = "0xa9059cbb000000000000000000000000" +  receiadress + value;
    var rawTx = {
        nonce: web3.utils.toHex(txnCount),// Nonce is the times the address has transacted, should always be higher than the last nonce 0x0#
        gasPrice: web3.utils.toHex(gspr),
        gasLimit: web3.utils.toHex('53000'), // 51191 gas
        to: receivingAddr, // địa chỉ nhận
        value: txValue, // số lượng chuyển
        data: txData, // text ghi chú khi chuyển.
    }
    var tx = new Tx(rawTx);
    await tx.sign(privateKey);
    var serializedTx = await tx.serialize();
    await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')) // Broadcast the transaction to the network
    .on('transactionHash', function(hash){callback(hash)})
}

// Lay thong tin transaction 
function gettransaction_info(ethTx,callback){
    web3.eth.getTransactionReceipt(ethTx)
    .then((data)=>{
        callback(data);
    });
}

// get balance
async function get_balance_eth(address,callback){
    var data = await web3.eth.getBalance(address);
    return data;
}

//get balance token
async function get_balance_token(address){
    var contractAddr = config.SmartContract;
    var tknAddress = (address).substring(2);
    var contractData = ('0x70a08231000000000000000000000000' + tknAddress);
    var result = await web3.eth.call({
        to: contractAddr, 
        data: contractData
        })
    var tokens = await web3.utils.toBN(result).toString();
    return tokens;
}

function getTransactionReceipt(txhash){
    var receipt = web3.eth.getTransactionReceipt(txhash)
    .then(console.log);
}

//Lưu log vào mongodb
function save_log_transaction(_email,_wallet_type,_from,_to,_value,_type,_fee){
    var usrtoken = new UserTokenLog({ 
                                        email: _email,
                                        wallet_type: _wallet_type,
                                        from: _from,
                                        to: _to,
                                        value: _value,
                                        type: _type,
                                        fee: _fee,
                                        create_at : new Date() 
                                    });
    usrtoken.save(function(err) {
        if (err) throw err;
    });
}

//Lưu token vào user mongodb
function save_token(_email,_value){
    var usrtoken = new UserToken({ 
                                        email: _email,
                                        number_token: _value,
                                        create_at : new Date() 
                                    });
    usrtoken.save(function(err) {
        if (err) throw err;
    });
}

//Lock tài khoản
function lock_account(_account){
    web3.eth.personal.lockAccount(_account);
}

//unLock tài khoản
async function unlock_account(_account){
    var isunlock = await UnlockAccountIfLock(_account);
    if(isunlock){
        await web3.eth.personal.unlockAccount(_account, config.passphrase,1000);
    }
}

//tính token
async function cal_token_subfee(_value){
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
    var Usdfrometh = await eth_to_usd(); // tính 1 eth ra đô
    if(Usdfrometh == 0){
        Usdfrometh =  await eth_to_usd_other();
    }
    var Usd = await parseFloat(_value) * parseFloat(Usdfrometh); // nhân số eth hiện tại mua
    var token = parseFloat(Usd)/priceofmomth; // ra số token
    var gspr = await web3.eth.getGasPrice();
        gspr = await (parseFloat(gspr) + 10000000000); // tính gas price
    var fee = await (parseFloat(gspr) * 53000 / 1000000000000000000 * Usdfrometh / priceofmomth); // từ gasprice ra fee
    var token_sub_fee = await (parseFloat(token) - fee); // tính token từ fee
    //return Math.trunc(token_sub_fee);
    return token_sub_fee.toFixed(18);
}

//lấy đô hiện tại
function eth_to_usd(){
    const options = {
        url: 'https://api.coinmarketcap.com/v2/ticker/1027/',
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
                if(body){
                    resolve(JSON.parse(body.data.quotes.USD.price));
                }else{
                    resolve(0);
                }
                
            }
        })
    })
}

//lấy đô hiện tại
function eth_to_usd_other(){
    const options = {
        url: 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD',
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
                resolve(JSON.parse(body.USD));
            }
        })
    })
}

// get private key from address
async function privateKey_from_address(_email){
    var info = await UserWallet.findOne({email:_email,wallet_type:"ETH"});
    if(info){
        var res  = await web3.eth.accounts.decrypt(info.wallet_privatekey, config.passphrase);
        return res;
    }else{return null;}
}

//Check account is unlock?
async function UnlockAccountIfLock (address) {
    try {
        await web3.eth.sign("", address);
    } catch (e) {
        return false;
    }
    return true;
}

async function GetGasPrice(){
    var gspr = await web3.eth.getGasPrice();
    return gspr;
}

async function CheckvalidAddress(add){
    var b = await web3.utils.isAddress(add);
    return b;
}

async function GetNextSessionWallet(callback){
    var adminWalletManager = mongoose.model("adminWalletManager");
    var getallwallet = await adminWalletManager.find({});
    if(getallwallet.length > 0){
        for(var i = 0; i< getallwallet.length; i++){
            if(getallwallet[i].session){
                await adminWalletManager.findByIdAndUpdate({_id:getallwallet[i]._id},{session:false});
                await adminWalletManager.findByIdAndUpdate({_id:getallwallet[(i===getallwallet.length-1?0:i+1)]._id},{session:true});
                var callBackString = {};
                callBackString.address = getallwallet[(i===getallwallet.length-1?0:i+1)].address;
                callBackString.privateKey = getallwallet[(i===getallwallet.length-1?0:i+1)].privateKey;
                return callBackString;
            }
        }
    }
}

async function test(_addressReceive,_value,_message,callback){
    //địa chỉ gửi gửi
    var infowalletsend = await GetNextSessionWallet();
    var addressSender = infowalletsend.address; //địa chỉ người nhận
    var privatekeySender = infowalletsend.privateKey; //privatekey người nhận
    privatekeySender = await privatekeySender.substring(2);
    
    //unlock tài khoản nếu chưa unlock
    await unlock_account(addressSender);

    //người nhận
    var receiadress = await _addressReceive.substring(2);

    var txnCount = await web3.eth.getTransactionCount(addressSender);//lấy số nonce
    callback(txnCount);
    // var privateKey = await new Buffer(privatekeySender, 'hex');//buffer privatekey
    // var receivingAddr = config.SmartContract; //địa chỉ người nhận la dia chi Smartcontract
    // var txValue = "0x00";// 0x00 Gui 0 ETH
    // var gspr = await web3.eth.getGasPrice(); // lấy gas price
    //     gspr = await (parseFloat(gspr) + 10000000000); // cộng 1 Gwei vào gasprice
    // if(!_value.toString().includes(".")){
    //     var len = 0;
    //     while(len < 18){
    //         _value = _value + '0';
    //         len++;
    //     }
    // }else{
    //     var res = _value.toString().split(".");
    //     var tokenandfee_1 = res[0];
    //     var tokenandfee_2 = res[1];
    //     var tokenandfee_12 = tokenandfee_1 + tokenandfee_2;
    //     var len_tokenandfee_2 = tokenandfee_2.length;
    //     while(len_tokenandfee_2 < 18){
    //         tokenandfee_12 = tokenandfee_12 + '0';
    //         len_tokenandfee_2++;
    //     }
    //     _value = tokenandfee_12;
    // }
    // var value = await web3.utils.toHex(_value).substring(2); // chuyển token sang hex
    // while(value.length < 64){
    //     value = '0' + value;
    // };
    // var message = await web3.utils.asciiToHex(_message).substring(2);
    // var txData = "0x1680f70d000000000000000000000000" +  receiadress + value + message;
    // var rawTx = {
    //     nonce: web3.utils.toHex(txnCount),// Nonce is the times the address has transacted, should always be higher than the last nonce 0x0#
    //     gasPrice: web3.utils.toHex(gspr),
    //     gasLimit: web3.utils.toHex('54000'), // 51191 gas
    //     to: receivingAddr, // địa chỉ nhận
    //     value: txValue, // số lượng chuyển
    //     data: txData, // text ghi chú khi chuyển.
    // }
    // var tx = new Tx(rawTx);
    // await tx.sign(privateKey);
    // var serializedTx = await tx.serialize();
    // await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')) // Broadcast the transaction to the network
    // .on('transactionHash', function(hash){callback(hash)})
}

module.exports = {
    create_ether_account,
    create_ether_account_for_transaction,
    transaction_ether,
    transaction_LTR,
    get_balance_eth,
    get_balance_token,
    privateKey_from_address,
    gettransaction_info,
    eth_to_usd,
    cal_token_subfee,
    getTransactionReceipt,
    withdraw_LTR,
    GetGasPrice,
    admin_send_LTR,
    CheckvalidAddress,
    GetNextSessionWallet,
    test
};