var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;
/**
 * User Token Schema
 */

var adminSendLTRLogSchema = new Schema({
    email_send: {
        type: String,
        lowercase: true,
        trim: true,
        default: ''
    },
    number_token: {
        type: Number,
        default: 0
    },
    addressReceive: {
        type: String,
        default: ''
    },
    txhash: {
        type: String,
        default: ''
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('adminSendLTRLog', adminSendLTRLogSchema);