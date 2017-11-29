const mongoose = require('mongoose');
const Input = require('./input');
const Output = require('./output');
const util = require('./util');

const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  txid:                String,
  witnessHash:         String,
  fee:                 Number,
  rate:                Number,
  ps:                  Number,
  blockHeight:         Number,
  blockHash:           String,
  blockTime:           Date,
  blockTimeNormalized: Date,
  index:               Number,
  version:             Number,
  flag:                Number,
  lockTime:            Number,
  inputs:              [Input.schema],
  outputs:             [Output.schema],
  size:                Number,
  network:             String,
  mainChain:           Boolean,
  mempool:             Boolean,
  rawTx:               Buffer,
  meta:                Buffer,
  raw:                 Buffer
});

TransactionSchema.index({ txid: 1 });
TransactionSchema.index({ blockHeight: 1 });
TransactionSchema.index({ blockHash: 1 });
TransactionSchema.index({ blockTime: 1 });
TransactionSchema.index({ blockTimeNormalized: 1 });
TransactionSchema.index({ 'inputs.address': 1 });
TransactionSchema.index({ 'outputs.address': 1 });
TransactionSchema.index({ mempool: 1 });

TransactionSchema.statics.saveBcoinTx = function saveBcoinTx(entry, tx, meta)  {
  const Transaction = this.model('Transaction');
  const txJSON = tx.toJSON();

  const t = new Transaction({
    txid:                txJSON.hash,
    witnessHash:         txJSON.witnessHash,
    fee:                 txJSON.fee,
    rate:                txJSON.rate,
    ps:                  txJSON.ps,
    blockHeight:         entry.height,
    blockHash:           entry.hash,
    blockTime:           entry.time/1000,
    blockTimeNormalized: entry.time/1000,
    index:               txJSON.index,
    version:             txJSON.version,
    flag:                txJSON.flag,
    inputs:              tx.inputs.map((input)   => {
      const inputJSON = input.toJSON();
      return {
        address: inputJSON.address
      };
    }),
    outputs:             tx.outputs.map((output) => {
      const outputJSON = output.toJSON();
      return {
        address: outputJSON.address
        };
    }),
    lockTime:            txJSON.locktime,
    network:             'main',
    mainChain:           true,
    mempool:             false,
    meta:                meta.toRaw(),
    raw:                 tx.toRaw()
  });
  t.save((err) => {
    if (err) {
      console.log(err);
    }
  });
};

TransactionSchema.statics.deleteBcoinTx = function deleteBcoinTx(txid) {
  return this.model('Transaction').find({ txid }).remove();
};

TransactionSchema.statics.getHashesByAddress = function getHashesByAddress(addr) {
  return new Promise((res, rej) => {
    return this.model('Transaction').find(
      {
        $or: [
          { 'inputs.address': addr },
          { 'outputs.address': addr }]
      },
      {
        txid: 1
      },
        (err, txs) => {
          err ? rej(err) : res(txs.map((tx) => {
            return util.revHex(tx.txid);
          }));
        }
    );
  });
};

TransactionSchema.statics.has = function has(txid) {
  return new Promise((res, rej) => {
    return this.model('Transaction')
      .findOne({ txid })
      .count((err, count) => {
        err ? rej(err) : res(count >= 1);
      });
  });
};

TransactionSchema.statics.getTxMeta = function getTxMeta(txid)  {
  return new Promise((res, rej) => {
    return this.model('Transaction').findOne(
      { txid: util.revHex(txid) },
      { meta: 1 },
      (err, tx) => {
        if (tx === null  || tx.meta === null) {
          res(null);
        } else {
          err ? rej(err) : res(Buffer.from(tx.meta, 'hex'));
        }
      });
  });
};

module.exports = TransactionSchema;
