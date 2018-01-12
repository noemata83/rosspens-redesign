const mongoose = require('mongoose');

const penSchema = new mongoose.Schema({
   inventorynumber: String,
   maker: String,
   title: String,
   type: String,
   nib: String,
   price: Number,
   images: [String],
   description: String,
   dateAdded: ({type: Date, default: Date.now })
});

module.exports = mongoose.model("Pen", penSchema);