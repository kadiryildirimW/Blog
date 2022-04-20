const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
  title: String,
  subtitle: String,
  content: String,
  images: String,
  background: String,
  handle: String
})

module.exports = mongoose.model('Post', postSchema)