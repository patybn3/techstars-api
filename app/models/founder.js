const mongoose = require('mongoose')

const founderSchema = new mongoose.Schema({
  founderUrl: {
    type: String
  },
  nameFounder: {
    type: String,
    required: true
  },
  titleFounder: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }
})

module.exports = mongoose.model('Founder', founderSchema)
