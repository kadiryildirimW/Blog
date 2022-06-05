const mongoose = require('mongoose')

const connection_string = process.env.CONNECTION_STRING || 'mongodb://localhost/blog-kadir'

async function connectDatabase () {
  try {
    await mongoose.connect(connection_string)
    console.log('We are connected the mongodb')
  } catch (err) {
    console.error(err)
  }
}

connectDatabase()
