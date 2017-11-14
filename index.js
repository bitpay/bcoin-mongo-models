const Models = require('./models');

module.exports = function(mongoose) {
  for (key in Models) {
    exports[key] = mongoose.model(key, Models[key]);
  }
};

