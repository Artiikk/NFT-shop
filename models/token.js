const { Schema, model } = require('mongoose')

const TokenSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  img: String
})

// courseSchema.method('toClient', function() {
//   const course = this.toObject()

//   course.id = course._id
//   delete course._id

//   return course
// })

module.exports = model('Token', TokenSchema)