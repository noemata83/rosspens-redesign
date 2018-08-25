const Maker = require('../models/maker');
const Pen   = require('../models/pen');

module.exports = async () => {
  const makers = await Maker.find({});
  const makerChildren = makers.map(maker => Pen.find({ maker: maker._id, sold: false, type: 'vintage' }));
  const results = await Promise.all(makerChildren);
  const filteredMakers = makers.filter((_, index) => results[index].length > 0);
  const chunk = 5;
  const menuArray = [];
  for (let i = 0; i < filteredMakers.length; i += chunk) {
    menuArray.push(filteredMakers.slice(i, i+chunk));
  }
  return menuArray;
}