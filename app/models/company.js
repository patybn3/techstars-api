const mongoose = require('mongoose')
const Founder = require('./founder')
const founderSchema = Founder.schema

const companySchema = new mongoose.Schema({
  companyUrl: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  founded: {
    type: String,
    required: true
  },
  website: {
    type: String,
    required: true
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  founder: [ founderSchema ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Company', companySchema)
