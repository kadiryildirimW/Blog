const mongoosePaginate = require('mongoose-paginate-v2')
const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
  title: String,
  subtitle: String,
  content: String,
  images: String,
  background: String,
  handle: {
    type: String,
    unique: true,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  public: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

mongoose.plugin(mongoosePaginate)

module.exports = mongoose.model('Post', postSchema)