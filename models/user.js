const mongoose = require('mongoose'),
    { Schema } = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'),
    validator = require('validator');

const userInfoSchema = new Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    default: mongoose.Types.ObjectId(),
    validate: {
      validator: v => mongoose.Types.ObjectId.isValid(v),
      message: "_id invalide"
    },
    set: v => mongoose.Types.ObjectId.isValid(v) ? v : mongoose.Types.ObjectId()
  },
  joinedAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
  first_name: {
      type: String,
      required: true,
  },
  last_name: {
    type: String,
    required: true,
},
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: 'L\'adresse email est requise',
    validate: {
      validator: v => validator.isEmail(v),
      message: 'Email invalide'
    },
    set: v => validator.normalizeEmail(v),
    unique: true
  },
  code: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    required: true,
    default: false
  },
  imageUrl: {
    type: String,
    required: true,
  }
});

userInfoSchema.plugin(uniqueValidator);

const User = mongoose.model('users', userInfoSchema);

module.exports = User;