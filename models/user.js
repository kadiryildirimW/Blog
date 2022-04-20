const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  contactPass: String,
  contactEmail: String,
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)