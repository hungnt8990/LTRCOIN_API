var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;
/**
 * User Token Schema
 */

var adminWalletManagerSchema = new Schema({
    address: {
        type: String,
        trim: true,
        default: ''
    },
    Type: {
        type: String,
        default: ''
    },
    privateKey: {
        type: String,
        default: ''
    },
    session: {
        type: Boolean,
        default: false
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('adminWalletManager', adminWalletManagerSchema);