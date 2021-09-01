const { Router } = require('express')
const Token = require('../models/token')
const authMiddleware = require('../middleware/authMiddleware')
const { tokenValidators } = require('../utils/validators/token')
const { validationResult } = require('express-validator')
const router = Router()

router.get('/', authMiddleware, (req, res) => {
  res.render('add', {
    title: 'Add Token',
    isAdd: true
  })
})

router.post('/', authMiddleware, tokenValidators, async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).render('add', {
      title: 'Add course',
      isAdd: true,
      error: errors.array()[0].msg,
      data: {
        title: req.body.title,
        price: req.body.price,
        img: req.body.img
      }
    })
  }

  const { body, user } = req
  const { title, price, img } = body

  const token = new Token({ title, price, img, userId: user._id })

  try {
    await token.save()
    res.redirect('/tokens')
  } catch (err) {
    console.log('err', err)
  }
})

module.exports = router