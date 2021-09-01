const { Router } = require('express')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport')
const { validationResult } = require('express-validator')
const { registerValidators } = require('../utils/validators/register')
const { loginValidators } = require('../utils/validators/login')
const User = require('../models/user')
const regEmail = require('../mails/registrations')
const resetEmail = require('../mails/reset')
const crypto = require('crypto')
const { v4: uuid } = require('uuid')
const router = Router()
require('dotenv').config()

const SENDGRID_MAIL_KEY = process.env.SENDGRID_MAIL_KEY

const transporter = nodemailer.createTransport(sgTransport({
  auth: {
    api_key: SENDGRID_MAIL_KEY
  }
}))

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Authorization',
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError'),
    registrationPending: req.query.pending,
    activationSuccess: req.query.activation
  })
})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login')
  })
})

router.post('/login', loginValidators, async (req, res) => {
  try {
    const { email, password } = req.body

    const candidate = await User.findOne({ email })

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('loginError', errors.array()[0].msg)
      return res.status(400).redirect('/auth/login#login')
    }

    if (candidate) {
      const passwordIsValid = await bcrypt.compare(password, candidate.password)
      const isActivated = candidate.isActivated

      if (!isActivated) {
        req.flash('loginError', 'Please activate your account first!')
        return res.redirect('/auth/login#login')
      }

      if (passwordIsValid) {
        req.session.user = candidate
        req.session.isAuthenticated = true
        req.session.save((err) => {
          if (err) throw err
          res.redirect('/')
        })
      } else {
        req.flash('loginError', 'Password is wrong!')
        res.redirect('/auth/login#login')
      }
    } else {
      req.flash('loginError', 'There are no users with these credentials!')
      res.redirect('/auth/login#login')
    }
  } catch (e) {
    console.log(e)
  }
})

router.post('/register', registerValidators, async (req, res) => {
  try {
    const { email, password, name } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg)
      return res.status(422).redirect('/auth/login#register')
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = uuid()

    const user = new User({
      email,
      name,
      userId,
      password: hashedPassword,
      cart: { items: [] }
    })

    await user.save()
    res.redirect('/auth/login?pending=true#login')
    await transporter.sendMail(regEmail(email, userId))
  } catch (err) {
    console.log(err)
  }
})

router.get('/activation/:uuid', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.uuid })

    if (user) {
      await user.activate()
      await user.save()
      res.redirect('/auth/login?activation=true#login')
    } else {
      req.flash('loginError', 'Your activation was not successful')
      res.redirect('/auth/login#login')
    }
  } catch (e) {
    console.log(e)
  }
})

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Forgot password?',
    error: req.flash('error')
  })
})

router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('error', 'Try one more time')
        return res.redirect('/auth/reset')
      }

      const token = buffer.toString('hex')
      const candidate = await User.findOne({ email: req.body.email })

      if (candidate) {
        candidate.resetToken = token
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000 // 1 hour
        await candidate.save()
        await transporter.sendMail(resetEmail(candidate.email, token))
        res.redirect('/auth/login')
      } else {
        req.flash('error', 'Email is not exist')
        res.redirect('/auth/reset')
      }
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/password/:token', async (req, res) => {
  if (!req.params.token) {
    return res.redirect('/auth/login')
  }

  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() }
    })

    if (!user) return res.redirect('/auth/login')

    res.render('auth/password', {
      title: 'Update password',
      error: req.flash('error'),
      userId: user._id.toString(),
      token: req.params.token
    })
  } catch (e) {
    console.log(e)

    res.render('auth/reset', {
      title: 'Forgot password?',
      error: req.flash('error')
    })
  }
})

router.post('/password', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() }
    })

    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10)
      user.resetToken = null
      user.resetTokenExp = null
      await user.save()
      res.redirect('/auth/login')
    } else {
      req.flash('loginError', 'Token lifetime was expired')
      res.redirect('/auth/login')
    }
  } catch (e) {
    console.log(e)
  }
})

module.exports = router