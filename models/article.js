const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
   title: String,
   longTitle: String,
   content: String,
   dateAdded: ({type: Date, default: Date.now })
});

module.exports = mongoose.model("Article", articleSchema);