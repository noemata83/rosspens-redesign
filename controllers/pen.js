const Pen = require('../models/pen');
const Maker = require('..models/maker');
const slugify = require('slugify');

const createPen = async (req, res) => {
  try {
    const maker = await Maker.find({ name: req.body.maker });
    const penToCreate = {
      inventoryNumber: req.body.inventoryNumber,
      title: req.body.title,
      slug: slugify(req.body.title).toLowerCase(),
      maker: maker._id,
      description: req.body.description,
      type: req.body.type,
      nib: req.body.nib,
      price: req.body.price,
      images: req.body.imageURLs.split(','),
    };
    const newPen = await Pen.create(penToCreate);
    res.redirect(`/pens/${newPen.maker}/${newPen.type}`);
  } catch(err) {
    res.send(`There was an error: ${err}`);
  }
}

const findPenByMakerAndType = async (req, res) => {
  try {
    const maker = await Maker.findOne({ slug: req.params.maker });
    const pens = await Pen.find({ maker: maker._id, type: req.params.type, sold: false });
    res.render("index", { pens, sort: maker.name, banner: maker.bannerImage });
  } catch(err) {
    console.log(err);
    res.render("index", { pens: [] });
  }
}

module.exports = {
  createPen,
  findPenByMakerAndType
}