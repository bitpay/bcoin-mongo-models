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
    required: false
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
    required: false
  },
  _bip32version: {
    type: Number,
    required: false
  },
  _authPublicKey: {
    type: String,
    required: true
  },
  _publicKeyHash: {
    type: String,
    required: true
  },
});

WalletSchema.index({ _publicKeyHash: 1 });

WalletSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._publicKeyHash;
    delete ret._publicKeyHash;
    delete ret._id
    delete ret._lastKnownDerivationIndex;
    delete ret._bip32version;
    delete ret._authPublicKey;
  }
});

WalletSchema.virtual('isDeterministic', {
  get: function() {
    return typeof this.xpubkey !== 'undefined' &&
      typeof this._lastKnownDerivationIndex !== 'undefined' &&
      typeof this._bip32version !== 'undefined';
  }
});

module.exports = WalletSchema;
