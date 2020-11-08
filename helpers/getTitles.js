const mongoose = require("mongoose"),
  Article = require("../models/article")

function getTitles() {
  return Article.find({}).select({ title: 1, _id: 0 })
}

module.exports = getTitles
