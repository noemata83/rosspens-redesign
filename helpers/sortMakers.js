module.exports = makers => {
  if (makers.find(maker => maker.name.toLowerCase().includes("other"))) {
    const other = makers.find(maker => maker.name.toLowerCase().includes("other"));
    return makers.filter(maker => !maker.name.toLowerCase().includes("other")).concat(other);
  }
  return makers;
}