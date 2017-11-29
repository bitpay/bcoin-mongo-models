const mongoose = require('mongoose');
const util = require('./util');

const Schema = mongoose.Schema;
// These limits can be overriden higher up the stack
const MAX_BLOCKS = 100;

const BlockSchema = new Schema({
  network:           { type:  String, default:  '' },
  mainChain:         { type:   Boolean, default: false },
  height:            { type:  Number, default:  0 },
  hash:              { type:  String, default:  '' },
  version:           { type:  Number, default:  0 },
  merkleRoot:        { type:  String, default:  '' },
  time:              { type:  Date, default:    0 },
  timeNormalized:    { type:  Date, default:    0 },
  nonce:             { type:  Number, default:  0 },
  previousBlockHash: { type:  String, default:  '' },
  nextBlockHash:     { type:  Buffer, default:  '' },
  transactionCount:  { type:  Number, default:  1},
  size:              { type:  Number, default:  0 },
  bits:              { type:  Number, default:  0 },
  reward:            { type:  Number, default:  0 },
  chainwork:         { type:  Number, default:  0 },
  txs:               [{ type: String, default:  '' }],
  poolInfo:          { type:  Object, default:  {} },
  rawBlock:          { type:  Buffer, default:  '' }
}, {
  toJSON: {
    virtuals: true
  },
  id: false
});

BlockSchema.index({ hash: 1 }, { unique: true });
BlockSchema.index({ height: 1 });
BlockSchema.index({ time: 1 });
BlockSchema.index({ timeNormalized: 1 });
BlockSchema.index({ mainChain: 1 });
BlockSchema.index({ previousBlockHash: 1, mainChain: 1 });

BlockSchema.statics.byHeight = function byHeight(height) {
  return this.model('Block').findOne({ height });
};

BlockSchema.statics.byHash = function byHash(hash) {
  return this.model('Block').findOne({ hash });
};

BlockSchema.statics.getRawBlock = function getRawBlock(hash) {
  return new Promise((res, rej) => {
    return this.model('Block').findOne(
      { hash },
      { rawBlock: 1 },
      (err, block) => {
        return err ? rej(err) : res(Buffer.from(block.rawBlock, 'hex'));
      });
  });
};

BlockSchema.statics.last = function last(cb) {
  return this.model('Block').find(
    {},
    cb)
    .limit(MAX_BLOCKS)
    .sort({ height: -1 });
};

BlockSchema.statics.getHeights = function getHeights(cb) {
  return this.model('Block').find(
    {},
    { height: 1 },
    cb)
    .sort({ height: 1 });
};

BlockSchema.statics.tipHash =  function tipHash(cb)  {
  return this.last((err, block) => {
    if (err) {
      return cb(err);
    }
    return cb(null, block.hash);
  })
    .limit(1);
};

BlockSchema.statics.getBlockHeightByHash = function getBlockHeightByHash(hash) {
  return this.model('Block').findOne({ hash });
};

BlockSchema.statics.getBlockHashByHeight = function getBlockHashByHeight(height) {
  return new Promise((res, rej) => {
    return this.model('Block').findOne(
      { height },
      { hash: 1 },
        (err, block) => {
          if (err) {
            rej(err);
          }
        return block === null ? res(block) : res(Buffer.from(block.hash, 'hex'));
      });
  });
};

BlockSchema.statics.updateNextBlock = function updateNextBlock(hash, nextHash) {
  return this.model('Block').findOne(
    {hash: hash},
    (err, block) => {
      if (!err && block) {
        block.nextBlockHash = nextHash;
        return block.save();
      }
    }
  );
};

BlockSchema.statics.getNextHash = function getNextHash(hash) {
  return new Promise((res, rej) => {
    return this.model('Block').findOne(
      { hash: hash },
      (err, block) => {
        if (err || !block) {
          rej(err);
        }
        if (block === null) {
          res(block);
        } else {
          res(block.nextBlockHash);
        }
      }
    );
  });
};

BlockSchema.statics.saveBcoinBlock = function saveBcoinBlock(entry, block) {
  const Block     = this.model('Block');
  const rawBlock  = block.toRaw();
  const blockJSON = block.toJSON();
  const reward    = util.calcBlockReward(entry.height);

  return new Block({
    mainChain:         true,
    hash:              block.hash().toString('hex'),
    height:            entry.height,
    size:              block.getSize(),
    version:           blockJSON.version,
    previousBlockHash: blockJSON.prevBlock,
    merkleRoot:        blockJSON.merkleRoot,
    time:              blockJSON.time/1000,
    timeNormalized:    blockJSON.time/1000,
    bits:              blockJSON.bits,
    nonce:             blockJSON.nonce,
    transactionCount:  block.txs.length,
    txs:               block.txs.map((tx) => {
      const txJSON = tx.toJSON();
      return txJSON.hash;
    }),
    chainwork:         entry.chainwork,
    reward,
    network:           'main',
    poolInfo:          {},
    rawBlock
  }).save();
};

BlockSchema.statics.deleteBcoinBlock = function deleteBcoinBlock(hash) {
  return this.model('Block').find({ hash }).remove();
};

module.exports = BlockSchema;
