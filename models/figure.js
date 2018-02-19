const mongoose = require('mongoose');

const figureSchema = new mongoose.Schema({
    URL: String
});

module.exports = mongoose.model('Figure', figureSchema);