const User = require('./models/user')
const jwt = require('jsonwebtoken')

async function isAuthenticated (req, res, next) {
  try {
    const token = req.cookies.token
    const secret_key = process.env.SECRET_KEY || 'tom cat'
    if (token) {
      const { _id } = jwt.verify(token, secret_key)
      const user = await User.findById(_id)
      if (user) {
        req.user = user
        res.locals.user = { 
          name: user.name,
          email: user.email
        }
      } else {
        req.user = null
      }
    } else {
      req.user = null
    }
    next()
  } catch (err) {
    req.user = null
    next()
    console.error(err)
  }
}

async function ensureAuthenticated (req, res, next) {
  if (req.user) {
    next()
  } else {
    res.render('login', {
      alert: { text: 'Lütfen önce giriş yapın.', type: 'danger' }
    })
  }
}

module.exports = {
  isAuthenticated,
  ensureAuthenticated
}
