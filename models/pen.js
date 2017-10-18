var mongoose = require('mongoose');

var penSchema = new mongoose.Schema({
   itemid: String,
   maker: String,
   model: String,
   type: String,
   year: Number,
   price: Number,
   images: [String],
   description: String,
   dateAdded: ({type: Date, default: Date.now })
});

module.exports = mongoose.model("Pen", penSchema);