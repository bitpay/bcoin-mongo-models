const Models = require('./models');

module.exports = function(mongoose) {
  const retObj = {};
  for (key in Models) {
    retObj[key] = mongoose.model(key, Models[key]);
  }
  return retObj;
};

