'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WalletAddressSchema = new Schema({
  wallet:  Schema.Types.ObjectId,
  address: String
});

WalletAddressSchema.index({ address: 1, wallet: 1 });

module.exports = WalletAddressSchema;
