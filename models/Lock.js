'use strict';

var mongoose = require('mongoose'),
  bcrypt = require('bcrypt'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
  //var ObjectId = mongoose.Schema.Types.ObjectId;
/**
 * User Schema
 */
var LockSchema = new Schema({
  lock_withdraw: {
    type: Boolean,
    trim: true,
    default: false
  },
  lock_buytoken: {
    type: Boolean,
    trim: true,
    default: false
  }
});


mongoose.model('Lock', LockSchema);