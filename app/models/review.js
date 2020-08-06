const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  stars: {
    type: Number,
    required: true
  }
})

module.exports = mongoose.model('Review', reviewSchema)
