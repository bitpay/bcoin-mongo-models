'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WalletSchema = new Schema({
  name: String
});

module.exports = WalletSchema;
