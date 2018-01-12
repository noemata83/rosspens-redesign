const mongoose = require('mongoose'),
      Article = require('../models/article');
      
function getTitles() {
    return Article.find({}).select({'title': 1, '_id': 0}).exec((err, articles) => {
        if(err) {
            console.log(err);
        } else {
            return articles;
        }
    });
}

module.exports = getTitles;