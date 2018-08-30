var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;
/**
 * User Token Schema
 */

var UserTokenSchema = new Schema({
  email: {
    type: String,
    //unique: true,
    lowercase: true,
    trim: true,
    required: true
  },
  number_token: {
    type: Number,
    required: true
  },
  creat_at: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('UserToken', UserTokenSchema);