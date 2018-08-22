const Maker = require('../models/maker');
const slugify = require('slugify');

const createMaker = async (req, res) => {
  const newMaker = req.body;
  newMaker.slug = slugify(req.body.name);
  try {
    const createdMaker = await Maker.create(newMaker);
    res.redirect(`/pens/${createdMaker.slug}`);
  } catch(err) {
    res.send(`There was an error: ${err}`);
  }
}

const updateMaker = async (req, res) => {
  const updates = req.body;
  updates.slug = slugify(req.body.name);
  try {
    const updatedMaker = await Maker.findOneAndUpdate({ slug: req.body.slug }, updates, { new: true });
    res.redirect(`/pens/${updatedMaker.slug}`);
  } catch(err) {
    res.send(`There was an error: ${err}`);
  }
}

const deleteMaker = async (req, res) => {
  try {
    await Maker.findOneAndRemove({ slug: req.body.slug });
    res.redirect('back');
  } catch(err) {
    res.send(`There was an error: ${err}`);
  }
}