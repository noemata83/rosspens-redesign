const mongoose = require('mongoose');

const makerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  bannerImage: String,
});

module.exports = mongoose.model('Maker', makerSchema);