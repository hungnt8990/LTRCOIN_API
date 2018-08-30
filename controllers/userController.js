const jwt           = require('jsonwebtoken');
const { body }      = require('express-validator/check');
const bcrypt        = require('bcrypt');
const mongoose      = require('mongoose');
var User            = mongoose.model('User');


const userController = {
    /**
    * Validate login
    * 
    */
    validate_login: [
        body('email', 'Email is required!!!')
            .not()
            .isEmpty()
            .isEmail()
            .withMessage('Correct email format.'),
        body('password', 'Password is required!!!')
            .not()
            .isEmpty()
    ],
    /**
     * function authen
     * 
     */
    auth(req, res){
        const errors = req.validationErrors();
        if (errors) {
            return res.status(500).json({
                success_flg: false,
                message: errors
            })
        }else{
            var email = req.body.email;
            var password = req.body.password;
            User.findOne({
                email: email
            }, function(err, user) {
                if (err) throw err;
                else if (!user) {
                        res.status(401).json({
                            success_flg: false,
                            message:"No such user found"
                        });
                }else{
                    bcrypt.compare(password, user.password, function(err, result) {
                        if (err) throw err;
                        if(!result){
                            res.status(401).json({
                                success_flg: false,
                                message:"Passwords did not match"
                            });
                        }else{
                            var payload = {_id:user._id};
                            var token = jwt.sign(payload, process.env.SECRET, {expiresIn: process.env.EXPIRETIMEJWT});
                            res.send({
                                success_flg: true,
                                message: "Enjoy your token!",
                                token:  token,
                                email: user.email
                            });
                        }    
                    });
                }
            });
        }
    }
}

module.exports = userController;