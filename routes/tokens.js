const { Router } = require('express')
const Token = require('../models/token')
const authMiddleware = require('../middleware/authMiddleware')
const { tokenValidators } = require('../utils/validators/token')
const { validationResult } = require('express-validator')
const router = Router()

const isOwner = (token, req) => 
  token.userId.toString() === req.user._id.toString()


router.get('/', async (req, res) => {
  // res.status(200)
  // res.sendFile(path.join(__dirname, 'views', 'about.html'))

  try {
    const tokens = await Token.find()
      .populate('userId', 'email name')
      .select('price title img')
  
    res.render('tokens', {
      title: 'NFT\'s for sale',
      isToken: true,
      userId: req.user ? req.user._id.toString() : null,
      tokens
    }) 
  } catch (e) {
    console.log(e)
  }
})

router.get('/:id/edit', authMiddleware, async (req, res) => {
  try {
    if (!req.query.allow) {
      return res.redirect('/')
    }
  
    const token = await Token.findById(req.params.id)

    if (!isOwner(token, req)) {
      return res.redirect('/tokens')
    }
  
    res.render('token-edit', {
      title: `Edit ${token.title}`,
      token
    })
  } catch (e) {
    console.log(e)
  }
})

router.post('/edit', authMiddleware, tokenValidators, async (req, res) => {
  const errors = validationResult(req)
  const { id } = req.body

  if (!errors.isEmpty()) {
    return res.status(400).redirect(req.get('referer')) // refresh
  }

  try {
    delete req.body.id
    const token = await Token.findById(id)

    if (!isOwner(token, req)) {
      return res.redirect('/courses')
    }

    await Token.findByIdAndUpdate(id, req.body)
    res.redirect('/tokens')
  } catch (e) {
    console.log(e)
  }
})

router.post('/remove', authMiddleware, async (req, res) => {
  try {
    await Token.deleteOne({ 
      _id: req.body.id,
      userId: req.user._id
    })
    res.redirect('/tokens')
  } catch (err) {
    console.log('err', err)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const token = await Token.findById(req.params.id)
    res.render('token', {
      layout: 'empty',
      title: `NFT ${token.title}`,
      token
    })
  } catch (e) {
    console.log(e)
  }
})

module.exports = router