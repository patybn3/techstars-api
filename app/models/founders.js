const mongoose = require('mongoose')

const foundersSchema = new mongoose.Schema({
  founderUrl: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
})

module.exports = mongoose.model('Founder', foundersSchema)
