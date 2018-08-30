const mongoose      = require('mongoose');
const express       = require('express');
const router        = express.Router();
const path          = require('path');
const multer        = require('multer');
const bcrypt        = require('bcrypt');
const saltRounds    = 10;
var datetimestamp   = Date.now();


//////////////////////////FRONT//////////////////////////
var storage_front = multer.diskStorage({ //multers disk storage settings
            destination: function (req, file, cb) {
                cb(null, 'public/img/uploads')
            },
            filename: function (req, file, cb) {
                cb(null, 'front_' +  file.fieldname + '_' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
            }
        });

var upload_front = multer({ //multer settings
    storage: storage_front,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.PNG' && ext !== '.jpg' && ext !== '.JPG' && ext !== '.jpeg' && ext !== '.JPEG') {
            return callback(new Error('Only *.jpg, *.jpeg, *.png are allowed'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024*1024*5
    }
}).single('profilepic_front');

//api
router.post('/profile/front', function(req, res){
    if(req.isAuthenticated()){
        upload_front(req,res,function(err){
            if(err){
                req.flash('messageupload', 'Upload Wrong.' + err);
                res.redirect('/profile');
            }
            else {
                if(req.file){
                    var User = mongoose.model('User');
                    var name = 'front_' +  req.file.fieldname + '_' + datetimestamp + '.' + req.file.originalname.split('.')[req.file.originalname.split('.').length -1];
                    User.findOneAndUpdate({email:req.user.email}, {cmnd_front:name}, {upsert:false}, function(err, doc){
                        if (err) req.flash('messageupload', err);
                    });
                    res.redirect('/profile');
                }else{
                    req.flash('messageupload', 'Please choose file before upload!');
                    res.redirect('/profile');
                }
            }
        });
    }else{
        res.render('sign-in',{message: req.flash('loginMessage')});
    }
});



//////////////////////////BACK//////////////////////////
var storage = multer.diskStorage({ //multers disk storage settings
            destination: function (req, file, cb) { cb(null, 'public/img/uploads') },
            filename: function (req, file, cb) {
                cb(null, 'back_' +  file.fieldname + '_' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
            }
        });

var upload_back = multer({ //multer settings
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.PNG' && ext !== '.jpg' && ext !== '.JPG' && ext !== '.jpeg' && ext !== '.JPEG') {
            return callback(new Error('Only *.jpg, *.jpeg, *.png are allowed'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024*1024*5
    }
}).single('profilepic_back');

router.post('/profile/back', function(req, res){
    if(req.isAuthenticated()){
        upload_back(req,res,function(err){
            if(err){
                req.flash('messageupload', 'Upload Wrong.' + err);
                res.redirect('/profile');
            }
            else {
                if(req.file){
                    var User = mongoose.model('User');
                    var name = 'back_' +  req.file.fieldname + '_' + datetimestamp + '.' + req.file.originalname.split('.')[req.file.originalname.split('.').length -1];
                    User.findOneAndUpdate({email:req.user.email}, {cmnd_back:name}, {upsert:false}, function(err, doc){
                        if (err) req.flash('messageupload', err);
                    });
                }else{
                    req.flash('messageupload', 'Please choose file before upload!');
                    res.redirect('/profile');
                }
            }
        });
    }else{
        res.render('sign-in',{message: req.flash('loginMessage')});
    }
});


//////////////////////////SELF//////////////////////////
var storage = multer.diskStorage({ //multers disk storage settings
            destination: function (req, file, cb) { cb(null, 'public/img/uploads') },
            filename: function (req, file, cb) {
                cb(null, 'self_' +  file.fieldname + '_' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
            }
        });

var upload_self = multer({ //multer settings
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.PNG' && ext !== '.jpg' && ext !== '.JPG' && ext !== '.jpeg' && ext !== '.JPEG') {
            return callback(new Error('Only *.jpg, *.jpeg, *.png are allowed'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024*1024*5
    }
}).single('profilepic_self');

//api
router.post('/profile/self', function(req, res){
    if(req.isAuthenticated()){
        upload_self(req,res,function(err){
            if(err){
                req.flash('messageupload', 'Upload Wrong.' + err);
                res.redirect('/profile');
            }
            else {
                if(req.file){
                    var User = mongoose.model('User');
                    var name = 'self_' +  req.file.fieldname + '_' + datetimestamp + '.' + req.file.originalname.split('.')[req.file.originalname.split('.').length -1];
                    User.findOneAndUpdate({email:req.user.email}, {cmnd_self:name}, {upsert:false}, function(err, doc){
                        if (err) req.flash('messageupload', err);
                    });
                    res.redirect('/profile');
                }else{
                    req.flash('messageupload', 'Please choose file before upload!');
                    res.redirect('/profile');
                }
            }
        });
    }else{
        res.render('sign-in',{message: req.flash('loginMessage')});
    }
});

//api
router.post('/profile/upprofile', function(req, res){
    if(req.isAuthenticated()){
        var User = mongoose.model('User');
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.user.email;
        var old_pwd = req.body.old_pwd;
        var new_pwd = req.body.new_pwd;
        User.findOne({email: email}, function(err, user) {
            if (err) {req.flash('messageprofile', err);}
            else{
                if(new_pwd != ""){
                    bcrypt.compare(old_pwd, user.password, function(err, resp) {
                        if(resp){
                            if(new_pwd.length >= 8){
                                bcrypt.hash(new_pwd, saltRounds, function(errhash, hash) {
                                    if(errhash){
                                        req.flash('messageprofile', errhash);
                                        res.redirect('/profile');
                                    }else{
                                        User.findOneAndUpdate({email:email}, {firstname:firstname,lastname:lastname,password:hash}, {upsert:false}, function(errsave, doc){
                                            if (errsave) 
                                            req.flash('messageprofile', errsave);
                                            res.redirect('/profile');
                                        });
                                    }
                                })
                            }else{
                                req.flash('messageprofile', 'New password must be greater than 7 characters');
                                res.redirect('/profile');
                            }
                        }else{
                            req.flash('messageprofile', 'Old password not match');
                            res.redirect('/profile');
                        }
                    });
                }else if(new_pwd < 8 && old_pwd >= 8){
                    req.flash('messageprofile', 'New password must be greater than 7 characters');
                    res.redirect('/profile');
                }
                else{
                    User.findOneAndUpdate({email:req.user.email}, {firstname:firstname,lastname:lastname}, {upsert:false}, function(err, doc){
                        if (err) 
                        req.flash('messageprofile', err);
                        res.redirect('/profile');
                    });
                }
            }
        })
    }else{
        res.render('sign-in',{message: req.flash('loginMessage')});
    }
});


module.exports = router;