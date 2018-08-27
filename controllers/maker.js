const Maker = require('../models/maker');
const Pen = require('../models/pen');
const slugify = require('slugify');


const newMaker = async (req, res) => {
  res.render("makers/edit", { maker: null });
}

const createMaker = async (req, res) => {
  const newMaker = {
    name: req.body.name,
    bannerImage: req.body.imageURL,
  }
  newMaker.slug = slugify(req.body.name).toLowerCase();
  try {
    await Maker.create(newMaker);
    res.redirect('/admin/makers');
  } catch(err) {
    res.send(`There was an error: ${err}`);
  }
}

const editMaker = async (req, res) => {
  const maker = await Maker.findOne({ slug: req.params.slug }).cache({});
  res.render("makers/edit", { maker });
}

const updateMaker = async (req, res) => {
  const updates = req.body;
  updates.slug = slugify(req.body.name).toLowerCase();
  try {
    await Maker.findOneAndUpdate({ slug: req.body.slug }, updates, { new: true });
    res.redirect(`/admin/makers`);
  } catch(err) {
    res.send(`There was an error: ${err}`);
  }
}

const deleteMaker = async (req, res) => {
  try {
    // first, find all of the pens that are listed under the maker to be deleted, and change
    // their maker to 'other'
    const targetMaker = await Maker.findOne({ slug: req.params.slug });
    const affectedPens = await Pen.find({ maker: targetMaker._id });
    if (affectedPens.length > 0) {
      const other = await Maker.findOne({ slug: 'other' });
      affectedPens.forEach(pen => {
        pen.maker = other._id;
        pen.save();
      })
    }
    await Maker.findOneAndRemove({ slug: req.params.slug });
    res.redirect('back');
  } catch(err) {
    res.send(`There was an error: ${err}`);
  }
}

module.exports = {
  newMaker,
  createMaker,
  updateMaker,
  deleteMaker,
  editMaker
}