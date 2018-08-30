var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var xoauth2 = require('xoauth2');
var request = require('request');
var config = require('../config');
// user: 'admin@ltrcoin.com',
// pass: 'Huynguyenviet1'
// user: 'info@ltrcoin.com',
// pass: 'LTRCoin@2018'

function renderaccesstoken(clientId,clientSecret,refreshToken){
    const options = {
        url: 'https://accounts.google.com/o/oauth2/token',
        method: 'POST',
        form: {
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        },
        json: true
    };
    // Return new promise
    return new Promise(function(resolve, reject) {
        // Do async job
        request.post(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body.access_token);
            }
        })
    })
}
async function send(_to,token,status){
    var datestring = new Date(Date.now()).toLocaleString();
    var accesstoken = await renderaccesstoken(config.clientId,config.clientSecret,config.refreshToken);
    var transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            xoauth2: xoauth2.createXOAuth2Generator({
                user: 'info@ltrcoin.com',
                clientId: config.clientId,
                clientSecret: config.clientSecret,
                refreshToken: config.refreshToken,
                accessToken: accesstoken
            })
        }
    }));
    
    
    var mailOptions;
    
    if(status == 'create'){
        mailOptions = {
            from: 'info@ltrcoin.com',
            to: _to,
            subject: 'LTRCoin Login',
            generateTextFromHTML: true,
            html: `<html>
                <head>
                <style>
                    .banner-color {
                    background-color: #eb681f;
                    }
                    .title-color {
                    color: #0066cc;
                    }
                    .button-color {
                    background-color: #0066cc;
                    }
                    @media screen and (min-width: 500px) {
                    .banner-color {
                    background-color: #0066cc;
                    }
                    .title-color {
                    color: #eb681f;
                    }
                    .button-color {
                    background-color: #eb681f;
                    }
                    }
                </style>
                </head>
                <body>
                <div style="background-color:#ececec;padding:0;margin:0 auto;font-weight:200;width:100%!important">
                    <table align="center" border="0" cellspacing="0" cellpadding="0" style="table-layout:fixed;font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                        <tbody>
                            <tr>
                            <td align="center">
                                <center style="width:100%">
                                    <table bgcolor="#FFFFFF" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto;max-width:512px;font-weight:200;width:inherit;font-family:Helvetica,Arial,sans-serif" width="512">
                                        <tbody>
                                        <tr>
                                            <td bgcolor="#F3F3F3" width="100%" style="background-color:#f3f3f3;padding:12px;border-bottom:1px solid #ececec">
                                                <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;width:100%!important;font-family:Helvetica,Arial,sans-serif;min-width:100%!important" width="100%">
                                                    <tbody>
                                                    <tr>
                                                        <td align="left" valign="middle" width="50%"><span style="margin:0;color:#4c4c4c;white-space:normal;display:inline-block;text-decoration:none;font-size:12px;line-height:20px">LTRCoin</span></td>
                                                        <td valign="middle" width="50%" align="right" style="padding:0 0 0 10px"><span style="margin:0;color:#4c4c4c;white-space:normal;display:inline-block;text-decoration:none;font-size:12px;line-height:20px">${datestring}</span></td>
                                                        <td width="1">&nbsp;</td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left">
                                                <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                    <tbody>
                                                    <tr>
                                                        <td width="100%">
                                                            <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                                <tbody>
                                                                <tr>
                                                                    <td align="center" bgcolor="#8BC34A" style="padding:20px 48px;color:#ffffff" class="banner-color">
                                                                        <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                                            <tbody>
                                                                            <tr>
                                                                                <td align="center" width="100%">
                                                                                    <h1 style="padding:0;margin:0;color:#ffffff;font-weight:500;font-size:20px;line-height:24px">Create New Account</h1>
                                                                                </td>
                                                                            </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="center" style="padding:20px 0 10px 0">
                                                                        <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                                            <tbody>
                                                                            <tr>
                                                                                <td align="center" width="100%" style="padding: 0 15px;text-align: justify;color: rgb(76, 76, 76);font-size: 12px;line-height: 18px;">
                                                                                    <h3 style="font-weight: 600; padding: 0px; margin: 0px; font-size: 16px; line-height: 24px; text-align: center;" class="title-color">Hi ${_to},</h3>
                                                                                    <p style="margin: 20px 0 30px 0;font-size: 15px;text-align: center;">you have registered successfully LTRCoin Website! Enjoy now!</p>
                                                                                </td>
                                                                            </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                </tr>
                                                                <tr>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left">
                                                <table bgcolor="#FFFFFF" border="0" cellspacing="0" cellpadding="0" style="padding:0 24px;color:#999999;font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                    <tbody>
                                                    <tr>
                                                        <td align="center" width="100%">
                                                            <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                                <tbody>
                                                                <tr>
                                                                    <td align="center" valign="middle" width="100%" style="border-top:1px solid #d9d9d9;padding:12px 0px 20px 0px;text-align:center;color:#4c4c4c;font-weight:200;font-size:12px;line-height:18px">Regards,
                                                                        <br><b>The LTRCoin Team</b>
                                                                    </td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td align="center" width="100%">
                                                            <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                                <tbody>
                                                                <tr>
                                                                    <td align="center" style="padding:0 0 8px 0" width="100%"></td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                                <td bgcolor="#F3F3F3" width="100%" style="background-color:#f3f3f3;padding:12px;border-bottom:1px solid #ececec">
                                                    <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;width:100%!important;font-family:Helvetica,Arial,sans-serif;min-width:100%!important" width="100%">
                                                        <tbody>
                                                        <tr>
                                                            <td align="left" valign="middle" width="50%"><span style="margin:0;color:#4c4c4c;white-space:normal;display:inline-block;text-decoration:none;font-size:12px;line-height:20px"></span></td>
                                                            <td valign="middle" width="50%" align="right" style="padding:0 0 0 10px"><span style="margin:0;color:#4c4c4c;white-space:normal;display:inline-block;text-decoration:none;font-size:12px;line-height:20px"></span></td>
                                                            <td width="1">&nbsp;</td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </center>
                            </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                </body>
            </html>`
        };
    }else if(status == 'forgetpassword'){
        mailOptions = {
            from: 'info@ltrcoin.com',
            to: _to,
            subject: 'LTRCoin Login',
            generateTextFromHTML: true,
            html: `<html>
                <head>
                <style>
                    .banner-color {
                    background-color: #eb681f;
                    }
                    .title-color {
                    color: #0066cc;
                    }
                    .button-color {
                    background-color: #0066cc;
                    }
                    @media screen and (min-width: 500px) {
                    .banner-color {
                    background-color: #0066cc;
                    }
                    .title-color {
                    color: #eb681f;
                    }
                    .button-color {
                    background-color: #eb681f;
                    }
                    }
                </style>
                </head>
                <body>
                <div style="background-color:#ececec;padding:0;margin:0 auto;font-weight:200;width:100%!important">
                    <table align="center" border="0" cellspacing="0" cellpadding="0" style="table-layout:fixed;font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                        <tbody>
                            <tr>
                            <td align="center">
                                <center style="width:100%">
                                    <table bgcolor="#FFFFFF" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto;max-width:512px;font-weight:200;width:inherit;font-family:Helvetica,Arial,sans-serif" width="512">
                                        <tbody>
                                        <tr>
                                            <td bgcolor="#F3F3F3" width="100%" style="background-color:#f3f3f3;padding:12px;border-bottom:1px solid #ececec">
                                                <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;width:100%!important;font-family:Helvetica,Arial,sans-serif;min-width:100%!important" width="100%">
                                                    <tbody>
                                                    <tr>
                                                        <td align="left" valign="middle" width="50%"><span style="margin:0;color:#4c4c4c;white-space:normal;display:inline-block;text-decoration:none;font-size:12px;line-height:20px">LTRCoin</span></td>
                                                        <td valign="middle" width="50%" align="right" style="padding:0 0 0 10px"><span style="margin:0;color:#4c4c4c;white-space:normal;display:inline-block;text-decoration:none;font-size:12px;line-height:20px">${datestring}</span></td>
                                                        <td width="1">&nbsp;</td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left">
                                                <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                    <tbody>
                                                    <tr>
                                                        <td width="100%">
                                                            <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                                <tbody>
                                                                <tr>
                                                                    <td align="center" bgcolor="#8BC34A" style="padding:20px 48px;color:#ffffff" class="banner-color">
                                                                        <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                                            <tbody>
                                                                            <tr>
                                                                                <td align="center" width="100%">
                                                                                    <h1 style="padding:0;margin:0;color:#ffffff;font-weight:500;font-size:20px;line-height:24px">Change your password</h1>
                                                                                </td>
                                                                            </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="center" style="padding:20px 0 10px 0">
                                                                        <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                                            <tbody>
                                                                            <tr>
                                                                                <td align="center" width="100%" style="padding: 0 15px;text-align: justify;color: rgb(76, 76, 76);font-size: 12px;line-height: 18px;">
                                                                                    <h3 style="font-weight: 600; padding: 0px; margin: 0px; font-size: 16px; line-height: 24px; text-align: center;" class="title-color">Hi ${_to},</h3>
                                                                                    <p style="margin: 20px 0 30px 0;font-size: 15px;text-align: center;">Click bottom button to change new password!</p>
                                                                                    <div style="font-weight: 200; text-align: center; margin: 25px;"><a href="https://ltrcoin.com/changepass?token=${token}" style="padding:0.6em 1em;border-radius:600px;color:#ffffff;font-size:14px;text-decoration:none;font-weight:bold" class="button-color">Click to change password</a></div>
                                                                                    <p style="margin: 20px 0 30px 0;font-size: 15px;text-align: center;">The link expires in 10 minutes and can be used only once.</p>
                                                                                </td>
                                                                            </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                </tr>
                                                                <tr>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left">
                                                <table bgcolor="#FFFFFF" border="0" cellspacing="0" cellpadding="0" style="padding:0 24px;color:#999999;font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                    <tbody>
                                                    <tr>
                                                        <td align="center" width="100%">
                                                            <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                                <tbody>
                                                                <tr>
                                                                    <td align="center" valign="middle" width="100%" style="border-top:1px solid #d9d9d9;padding:12px 0px 20px 0px;text-align:center;color:#4c4c4c;font-weight:200;font-size:12px;line-height:18px">Regards,
                                                                        <br><b>The LTRCoin Team</b>
                                                                    </td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td align="center" width="100%">
                                                            <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                                <tbody>
                                                                <tr>
                                                                    <td align="center" style="padding:0 0 8px 0" width="100%"></td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                                <td bgcolor="#F3F3F3" width="100%" style="background-color:#f3f3f3;padding:12px;border-bottom:1px solid #ececec">
                                                    <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;width:100%!important;font-family:Helvetica,Arial,sans-serif;min-width:100%!important" width="100%">
                                                        <tbody>
                                                        <tr>
                                                            <td align="left" valign="middle" width="50%"><span style="margin:0;color:#4c4c4c;white-space:normal;display:inline-block;text-decoration:none;font-size:12px;line-height:20px"></span></td>
                                                            <td valign="middle" width="50%" align="right" style="padding:0 0 0 10px"><span style="margin:0;color:#4c4c4c;white-space:normal;display:inline-block;text-decoration:none;font-size:12px;line-height:20px"></span></td>
                                                            <td width="1">&nbsp;</td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </center>
                            </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                </body>
            </html>`
        };
    }
    
      
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            return "OK";
        }
    });
}

module.exports = {send}