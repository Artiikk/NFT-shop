const { Router } = require('express')
const Order = require('../models/order')
const authMiddleware = require('../middleware/authMiddleware')
const router = Router()

const getPrice = ({ tokens }) => {
  return tokens.reduce((acc, c) => acc += c.token.price * c.count, 0)
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order
      .find({ 'user.userId': req.user._id })
      .populate('user.userId')

    const formattedOrders = orders.map(el => ({ ...el.toJSON(), price: getPrice(el) }))

    res.render('orders', {
      isOrder: true, 
      title: 'Orders',
      orders: formattedOrders
    })

  } catch (err) {
    console.log('err', err)
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.tokenId').execPopulate()

    const tokens = user.cart.items.map(({ tokenId, count }) => ({
      count,
      token: tokenId.toJSON()
    }))

    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user._id
      },
      tokens
    })

    await order.save()
    await req.user.clearCart()

    res.redirect('/orders')
  } catch (err) {
    console.log('err', err)
  }
})

module.exports = router