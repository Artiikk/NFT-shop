const { body } = require('express-validator')

exports.loginValidators = [
  body('email')
    .isEmail().withMessage('Please type correct email')
    .normalizeEmail()
]