const Maker = require('../models/maker');
const Pen   = require('../models/pen');
const sortMenu = require('./sortMakers');

module.exports = async () => {
  const makers = await Maker.find({});
  const makerChildren = makers.map(maker => Pen.find({ maker: maker._id, sold: false, type: 'vintage' }));
  const results = await Promise.all(makerChildren);
  const filteredMakers = makers.filter((_, index) => results[index].length > 0);
  const sortedMenu = sortMenu(filteredMakers);
  const chunk = 5;
  const menuArray = [];
  for (let i = 0; i < sortedMenu.length; i += chunk) {
    menuArray.push(sortedMenu.slice(i, i+chunk));
  }
  return menuArray;
}