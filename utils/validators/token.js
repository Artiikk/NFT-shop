const { body } = require('express-validator')

exports.tokenValidators = [
  body('title').isLength({ min: 3 }).withMessage('Minimal length should be at least 3 characters long').trim(),
  body('price').isNumeric().withMessage('Please type correct price'),
  // body('image').isURL().withMessage('Please type correct URL')
]