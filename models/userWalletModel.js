var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * User Wallet Schema
 */

var UserWalletSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true
  },
  wallet_type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  wallet_address: {
    type: String,
    required: true
  },
  wallet_privatekey: {
    type: String,
    required: true
  },
  creat_at: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('UserWallet', UserWalletSchema);