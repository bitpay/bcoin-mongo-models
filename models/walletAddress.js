'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WalletAddressSchema = new Schema({
  wallet: String,
  address: String
});

WalletAddressSchema.index({ address: 1, wallet: 1 });

WalletAddressSchema.statics.getWalletAddresses = function getWalletAddresses() {
  return this.model('WalletAddress').find({});
};

module.exports = WalletAddressSchema;
