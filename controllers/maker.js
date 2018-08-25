const Maker = require('../models/maker');
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
    const createdMaker = await Maker.create(newMaker);
    res.redirect('/admin/makers');
  } catch(err) {
    res.send(`There was an error: ${err}`);
  }
}

const editMaker = async (req, res) => {
  const maker = await Maker.findOne({ slug: req.params.slug });
  res.render("makers/edit", { maker });
}

const updateMaker = async (req, res) => {
  const updates = req.body;
  updates.slug = slugify(req.body.name).toLowerCase();
  try {
    const updatedMaker = await Maker.findOneAndUpdate({ slug: req.body.slug }, updates, { new: true });
    res.redirect(`/pens/${updatedMaker.slug}`);
  } catch(err) {
    res.send(`There was an error: ${err}`);
  }
}

const deleteMaker = async (req, res) => {
  try {
    console.log(req.params.slug);
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