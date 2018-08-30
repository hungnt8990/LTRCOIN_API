'use strict';

var mongoose = require('mongoose'),
  bcrypt = require('bcrypt'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
  //var ObjectId = mongoose.Schema.Types.ObjectId;
/**
 * User Schema
 */
var UserSchema = new Schema({
  firstname: {
    type: String,
    trim: true,
    default: ''
  },
  lastname: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true
  },
  password: {
    type: String,
    trim: true,
    required: true
  },
  country: {
    type: String,
    default: ''
  },
  cmnd_front: {
    type: String,
    default: ''
  },
  cmnd_front_confimed: {
    type: Boolean,
    default: false
  },
  cmnd_back: {
    type: String,
    default: ''
  },
  cmnd_back_confimed: {
    type: Boolean,
    default: false
  },
  cmnd_self: {
    type: String,
    default: ''
  },
  cmnd_self_confimed: {
    type: Boolean,
    default: false
  },
  reason_not_confirm: {
    type: String,
    default: ''
  },
  f2a: {
    type: String,
    default: ''
  },
  ref_id:{
    type: String,
    default: ''
  },
  ref_value:{
    type: Number,
    default: 0
  },
  is_admin: {
    type: Boolean,
    default: false
  },
  create_at: {
    type: Date,
    default: Date.now
  }
});

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

mongoose.model('User', UserSchema);