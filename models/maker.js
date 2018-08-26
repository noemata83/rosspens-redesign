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
  bannerImage: {
    type: String,
    default: 'https://rosspens-assets.s3.amazonaws.com/images/default_header.png'
  }
});

module.exports = mongoose.model('Maker', makerSchema);