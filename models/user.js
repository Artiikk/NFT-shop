const { Schema, model } = require('mongoose')

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  name: String,
  password: {
    type: String,
    required: true
  },
  avatarUrl: String,
  resetToken: String,
  resetTokenExp: String,
  userId: {
    type: String,
    required: true
  },
  isActivated: {
    type: Boolean,
    required: true,
    default: false
  },
  cart: {
    items: [
      {
        count: {
          type: Number,
          required: true,
          default: 1
        },
        tokenId: {
          type: Schema.Types.ObjectId,
          ref: 'Token',
          required: true
        }
      }
    ]
  }
})

userSchema.methods.addToCart = function(item) {
  const items = [...this.cart.items]

  const idx = items.findIndex(el => String(el.tokenId) === String(item._id))
  
  if (idx >= 0) {
    items[idx].count = items[idx].count + 1
  } else {
    items.push({
      tokenId: item._id,
      count: 1
    })
  }

  this.cart = { items }
  return this.save()
}

userSchema.methods.removeFromCart = function(id) {
  let items = [...this.cart.items]
  const idx = items.findIndex(el => String(el.tokenId) === String(id))

  if (items[idx].count === 1) {
    items = items.filter(el => String(el.tokenId) !== String(id))
  } else {
    items[idx].count--
  }

  this.cart = { items }
  return this.save()
}

userSchema.methods.clearCart = function() {
  this.cart = { items: [] }
  return this.save()
}

userSchema.methods.activate = function() {
  this.isActivated = true
  return this.save()
}

module.exports = model('User', userSchema)