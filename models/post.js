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
    ref: 'User',
    autopopulate: { maxDepth: 1, select: 'name' }
  },
  public: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

mongoose.plugin(require('mongoose-paginate-v2'))
mongoose.plugin(require('mongoose-autopopulate'))

module.exports = mongoose.model('Post', postSchema)