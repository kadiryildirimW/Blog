const express = require('express'),
      app = express()

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const fileUpload = require('express-fileupload')
const flash = require('connect-flash')

Date.prototype.fitDate = function () {
  let date = new Date(this)
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
  return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`
}

const cors = require('cors')

// const whitelist = process.env.CORS_WHITE_LIST ? process.env.CORS_WHITE_LIST.split(',') : ['htttp://localhost:8080']
const corsOptions = {
  // origin: function (origin, callback) {
  //   if (whitelist.indexOf(origin) !== -1) {
  //     callback(null, true)
  //   } else {
  //     callback(new Error('Not allowed by CORS'))
  //   }
  // }
}

app.use(cors(corsOptions))

if (!process.env.DISTRIBUTION) {
  require('dotenv').config()
}

require('./database-connection')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({ 
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false,
  secret: 'secret key'
}))
app.use(fileUpload())
app.use(flash())

app.use(express.static('public'))

const { isAuthenticated } = require('./auth')
app.use(isAuthenticated)

const pug = require('pug')
app.set('view engine', 'pug')

const homeRouter = require('./routes/home')
const aboutRouter = require('./routes/about')
const contactRouter = require('./routes/contact')
const userRouter = require('./routes/user')
const dashboardRouter = require('./routes/dashboard')
const postRouter = require('./routes/post')

app.use(homeRouter)
app.use(aboutRouter)
app.use(contactRouter)
app.use(userRouter)
app.use(dashboardRouter)
app.use(postRouter)

module.exports = app
