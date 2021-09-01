const { body } = require('express-validator')
const User = require('../../models/user')

const getSameEmailValidation = async (value) => {
  try {
    const user = await User.findOne({ email: value })
    if (user) return Promise.reject('User with this email already exists')
  } catch (e) {
    console.log(e)
  }
}

const getSamePasswordValidation = (value, { req }) => {
  if (value !== req.body.password) {
    throw new Error('Passwords should be the same')
  }
  return true
}

exports.registerValidators = [
  body('email')
    .isEmail().withMessage('Please type correct email')
    .custom(getSameEmailValidation).normalizeEmail(), // will transform all the letters to lowercase...
  body('password', 'Password should be min. 6 characters long')
    .isLength({ min: 6, max: 50 })
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom(getSamePasswordValidation)
    .trim(),
  body('name')
    .isLength({ min: 3 }).withMessage('Name should be min. 3 characters long')
    .trim()
]