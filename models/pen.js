const mongoose = require('mongoose');

const penSchema = new mongoose.Schema({
   inventoryNumber: String,
   maker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maker'
   },
   title: String,
   type: String,
   slug: {
      type: String,
      unique: true,
      required: true,
   },
   nib: String,
   price: Number,
   images: [String],
   description: String,
   sold: {
     type: Boolean,
     default: false,
   },
   dateAdded: ({type: Date, default: Date.now })
});

module.exports = mongoose.model("Pen", penSchema);