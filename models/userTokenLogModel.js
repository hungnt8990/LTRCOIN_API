var mongoose = require('mongoose');
var Schema = mongoose.Schema;
/**
 * User Token Log Schema
 */

var UserTokenLogSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: ''
  },
  value_ETH: {
    type: Number,
    default: 0
  },
  value_LTR: {
    type: Number,
    default: 0
  },
  txhash_ETH: {
    type: String,
    default: ''
  },
  txhash_LTR: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('UserTokenLog', UserTokenLogSchema);
