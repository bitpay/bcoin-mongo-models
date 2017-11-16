'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WalletSchema = new Schema({
  name: {
    type: String,
    default: ''
  },
  xpubkey: {
    type: Buffer,
    required: true
  },
  coin: {
    type: String,
    default: 'Bitcoin',
    required: true
  },
  testnet: {
    type: Boolean,
    default: false
  },
  _lastKnownDerivationIndex: {
    type: Number,
    default: 0,
    required: true
  }
});

WalletSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id
    delete ret._lastKnownDerivationIndex;
  }
});

module.exports = WalletSchema;
