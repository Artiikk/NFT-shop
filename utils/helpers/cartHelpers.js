function mapCartItems({ items }) {
  return items.map(el => ({ ...el.tokenId.toJSON(), count: el.count }))
}

module.exports = { mapCartItems }