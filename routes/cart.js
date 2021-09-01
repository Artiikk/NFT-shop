const Router = require('express')
const { mapCartItems } = require('../utils/helpers/cartHelpers')
const authMiddleware = require('../middleware/authMiddleware')
const Token = require('../models/token')
const router = Router()

function computePrice(items) {
  return items.reduce((total, item) => {
    return total += item.price * item.count
  }, 0)
}

router.post('/add', authMiddleware,  async (req, res) => {
  const currentItem = await Token.findById(req.body.id)
  await req.user.addToCart(currentItem)
  res.redirect('/cart')
})

router.get('/', authMiddleware, async (req, res) => {
  const user = await req.user.populate('cart.items.tokenId').execPopulate()

  const tokens = await mapCartItems(user.cart)

  res.render('cart', {
    tokens,
    title: 'Cart',
    isCart: true,
    price: computePrice(tokens)
  })
})

router.delete('/remove/:id', authMiddleware, async (req, res) => {
  await req.user.removeFromCart(req.params.id)
  const user = await req.user.populate('cart.items.tokenId').execPopulate()

  const tokens = await mapCartItems(user.cart)
  res.status(200).json({ tokens, price: computePrice(tokens) })
})

module.exports = router