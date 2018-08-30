const mongoose  = require('mongoose');
const config    = require('../server/config');
const fs        = require('fs');
var speakeasy   = require('speakeasy');
var QRCode      = require('qrcode');

// create F2a
async function createF2A(req, res) {
    if (req.isAuthenticated()) {
        var _email = req.user.email;
        var _f2a = req.user.f2a;
        var secret = speakeasy.generateSecret({length: 20,name: 'LTRCoin - ' + _email});
        var scrbase32 = secret.base32;
        if(_f2a == ''){
            QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
                res.json({result:true,srcode:scrbase32,image_data:image_data});
            });
        }
    } else {
        res.render('sign-in');
    }
};
// delete F2a
async function deleteF2A(req, res) {
    if (req.isAuthenticated()) {
        var _email = req.user.email;
        var _scrbase32 = req.user.f2a;
        var _userToken = req.body.userToken;
        var User = mongoose.model('User');
        var verified = speakeasy.totp.verify({
            secret: _scrbase32,
            encoding: 'base32',
            token: _userToken
        });
        if(verified){
            User.findOneAndUpdate({email:_email}, {f2a:''}, {upsert:false}, function(err, doc){
                if (err){
                    req.flash('messagef2a', 'Error when save!!!')
                }
                res.redirect('/profile');
            });
        }else{
            req.flash('messagef2a', 'Opp!!! Wrong number!!!')
            res.redirect('/profile');
        }
    } else {
        res.render('sign-in');
    }
};

async function saveF2A(req, res) {
    if (req.isAuthenticated()) {
        var _email = req.user.email;
        var _userToken = req.body.userToken;
        var _scrbase32 = req.body.scrbase32;
        var User = mongoose.model('User');
        var verified = speakeasy.totp.verify({
            secret: _scrbase32,
            encoding: 'base32',
            token: _userToken
        });
        if(verified){
            User.findOneAndUpdate({email:_email}, {f2a:_scrbase32}, {upsert:false}, function(err, doc){
                if (err){
                    req.flash('messagef2a', 'Error when save!!!')
                }
                res.redirect('/profile');
            });
        }else{
            req.flash('messagef2a', 'Opp!!! Wrong number!!!')
            res.redirect('/profile');
        }
    } else {
        res.render('sign-in');
    }
};

async function checkf2asecret(req, res) {
    if (req.isAuthenticated()) {
        var _userToken = req.param('userToken');
        var _scrbase32 = req.param('scrbase32');
        var verified = speakeasy.totp.verify({
            secret: _scrbase32,
            encoding: 'base32',
            token: _userToken
        });
        if(verified){
            res.json(true);
        }else{
            res.json(false);
        }
    } else {
        res.render('sign-in');
    }
};

module.exports = {
    createF2A,
    deleteF2A,
    saveF2A,
    checkf2asecret
};