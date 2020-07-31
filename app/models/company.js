const mongoose = require('mongoose')

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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: String,
    require: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Company', companySchema)
