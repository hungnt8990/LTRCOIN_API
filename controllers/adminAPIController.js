const mongoose      = require('mongoose');
const express       = require('express');
const router        = express.Router();
var etherController = require('../controllers/etherController');
var ether           = require('../server/util/ether');
var datetimestamp   = Date.now();


//api
router.post('/updateTxhash', function(req, res){
    if(req.isAuthenticated()){
        var UserTokenLog = mongoose.model('UserTokenLog');
        var id = req.body.id;
        var txhashltr = req.body.txhashltr;
        UserTokenLog.findOneAndUpdate({_id:id}, {txhash_LTR:txhashltr}, {upsert:false}, function(err, doc){
            if (!err) res.json('OK');
            else res.json('ERROR');
        });
        
    }else{
        res.render('login',{message: req.flash('loginMessage')});
    }
});

//api check profile
router.post('/confirmImage', function(req, res){
    if(req.isAuthenticated()){
        var User = mongoose.model('User');
        var id = req.body.id;
        var type = req.body.type;
        switch(type) {
            case 'cmnd_front_confimed':
                User.findOneAndUpdate({_id:id}, {
                    cmnd_front_confimed: true
                }, {upsert:false}, function(err, doc){
                    if (!err) res.json('OK');
                    else res.json('ERROR');
                });
                break;
            case 'cmnd_back_confimed':
                User.findOneAndUpdate({_id:id}, {
                    cmnd_back_confimed: true
                }, {upsert:false}, function(err, doc){
                    if (!err) res.json('OK');
                    else res.json('ERROR');
                });
                break;
            case 'cmnd_self_confimed':
                User.findOneAndUpdate({_id:id}, {
                    cmnd_self_confimed: true
                }, {upsert:false}, function(err, doc){
                    if (!err) res.json('OK');
                    else res.json('ERROR');
                });
            break;
            default:
                UserTokenLog.findOneAndUpdate({_id:id}, {
                    cmnd_front_confimed:true
                }, {upsert:false}, function(err, doc){
                    if (!err) res.json('OK');
                    else res.json('ERROR');
                });
        }
    }else{
        res.render('login',{message: req.flash('loginMessage')});
    }
});

//api unconfirm /admin/api/unconfirmed (req.body.addressReceive; req.body.numofeth;)
router.post('/unconfirmed', async function(req, res){
    if(req.isAuthenticated()){
        var User = mongoose.model('User');
        var id = req.body.id;
        var content = req.body.content;
        User.findOneAndUpdate({_id:id}, {
            reason_not_confirm: content,
            cmnd_front: "",
            cmnd_back: "",
            cmnd_self: "",
            cmnd_front_confimed: false,
            cmnd_back_confimed: false,
            cmnd_self_confimed: false
        }, {upsert:false}, function(err, doc){
            if (!err) res.json('OK');
            else res.json('ERROR');
        });
    }else{
        res.render('login',{message: req.flash('loginMessage')});
    }
});

//api save message reason
router.post('/confirmall', function(req, res){
    if(req.isAuthenticated()){
        var User = mongoose.model('User');
        var id = req.body.id;
        User.findOneAndUpdate({_id:id}, {
            cmnd_front_confimed: true,
            cmnd_back_confimed: true,
            cmnd_self_confimed: true
        }, {upsert:false}, function(err, doc){
            if (!err) res.json('OK');
            else res.json('ERROR');
        });
    }else{
        res.render('login',{message: req.flash('loginMessage')});
    }
});

// API lấy thông tin thưởng --  /admin/api/getrefltr   no parameter
router.get('/getrefltr', async function (req, res) {
    if (req.isAuthenticated()) {
        var User = mongoose.model('User');
        var data = await User.find({ ref_value: { $gt: 0 } }).sort({$ref_value:1});
        res.json(data);
    } else {
        res.render('sign-in', { message: req.flash('loginMessage') });
    }
});

// API lấy thông tin log
router.get('/getlogrefltr', async function (req, res) {
    if (req.isAuthenticated()) {
        var adminSendLTRLog = mongoose.model('adminSendLTRLog');
        var data = await adminSendLTRLog.find().sort({$create_at:-1});
        res.json(data);
    } else {
        res.render('sign-in', { message: req.flash('loginMessage') });
    }
});

// API Chuyển tiền LTR
router.post('/admin_send_ref_LTR',async function(req, res) {
    if (req.isAuthenticated()) {
        var UserWallet = mongoose.model('UserWallet');
        var email_refed = req.body.email_refed;
        var numofltr = req.body.numofltr;
        
        addressReceive = await UserWallet.findOne({email:email_refed});
        addressReceive = addressReceive.wallet_address;
        ether.admin_send_LTR(addressReceive, numofltr, (data) => {
            if(data){
                var adminSendLTRLog = mongoose.model('adminSendLTRLog');
                var adminSendLTRLog = new adminSendLTRLog({
                    email_send: email_refed,
                    number_token: numofltr,
                    addressReceive: addressReceive,
                    txhash: data,
                    create_at: new Date()
                });
                adminSendLTRLog.save(function (err) {
                    if (err) res.json({result:false,message:err});
                    else{
                        var User = mongoose.model('User');
                        User.findOneAndUpdate({email:email_refed}, {ref_value:0}, {upsert:false}, function(err, doc){
                            if (!err) {
                                res.json({result:true,message:'OK'});
                            }
                            else{
                                res.json({result:false,message:err});
                            }
                        });
                    }
                });
            }
            
        });
    } else {
        res.render('sign-in', { message: req.flash('loginMessage') });
    }
});

// API Tạo ví admin  --  /admin/api/create_ether_account_for_transaction   no parameter
router.get('/create_ether_account_for_transaction', function (req, res) {
    if (req.isAuthenticated()) {
        ether.create_ether_account_for_transaction((result)=>{
            if(result){
                res.json(result);
            }
        })
    } else {
        res.render('sign-in', { message: req.flash('loginMessage') });
    }
});

// API Lấy tất cả ví admin  --  /admin/api/get_all_wallet_admin   no parameter
router.get('/get_all_wallet_admin',async function (req, res) {
    if (req.isAuthenticated()) {
        var adminWalletManager = mongoose.model('adminWalletManager');
        var result = await adminWalletManager.find({});
        res.json(result);
    } else {
        res.render('sign-in', { message: req.flash('loginMessage') });
    }
});

// API Xóa ví ví admin  --  /admin/api/delete_one_wallet_admin  para: req.body.id;
router.post('/delete_one_wallet_admin',async function (req, res) {
    if (req.isAuthenticated()) {
        var adminWalletManager = mongoose.model('adminWalletManager');
        adminWalletManager.findByIdAndRemove(req.body.id, function (err,offer){
            if(err) res.json(err);
            else res.json('OK');
        })
    } else {
        res.render('sign-in', { message: req.flash('loginMessage') });
    }
});


// admin send token;  /admin/api/admin_send_LTR (req.body.addressReceive; req.body.numofeth;)
router.post('/admin_send_LTR',etherController.admin_send_LTR);//withdraw_LTR


router.get('/getallprofile', function(req, res, next) {
    var User = mongoose.model('User');
    var query = User.find({}).select({_id:0, "email": 1});
    query.exec(function (err, data) {
        if (err) return next(err);
        res.json(data);
    });
});

router.get('/getalluserbuyLTR', function(req, res, next) {
    var UserTokenLog = mongoose.model('UserTokenLog');
    var query = UserTokenLog.aggregate([
        {
          $group:
            {
              _id: { email:  "$email" },
              TongLTR: { $sum: "$value_LTR" },
              TongETH: { $sum: "$value_ETH" },
              Solanmua: { $sum: 1 }
            }
        }
      ]);
     
    query.exec(function (err, data) {
        if (err) return next(err);
        res.json(data);
    });
});

module.exports = router;