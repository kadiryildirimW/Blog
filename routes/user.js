const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const nodemailer = require('nodemailer')
const User = require('../models/user')
const { v4: uuidv4 } = require('uuid');

const { ensureAuthenticated } = require('../auth')

router.get('/login', (req, res) => { 
  const alert = req.flash('alert')[0]
  res.render('login', { alert })
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      res.render('login', {
        alert: { text: 'User not found, please check your email!', type: 'danger' },
        email
      })
      return
    }
    const compare = await bcrypt.compare(password, user.password)
    if (compare) {
      const secret_key = process.env.SECRET_KEY || 'tom cat'
      const session_duration = parseInt(process.env.SESSION_DURATION) || 1000 * 60 * 60 * 24 * 365 
      const token = jwt.sign({ _id: user._id }, secret_key, { expiresIn: session_duration });
      res.cookie('token', token, { expires: new Date(Date.now() + parseInt(session_duration))  })
      req.flash('alert', { text: 'Welcome boss!', type: 'success' })
      req.flash('email', email)
      res.redirect('/')
    } else {
      res.render('login', {
        alert: { text: 'Wrong password!', type: 'danger' },
        email
      })
    }
  } catch (err) {
    console.error(err)
  }
})

router.post('/update-user-data', ensureAuthenticated, async (req, res) => {
  try {
    const { name, email } = req.body
    const update = {}
    update.name = name
    update.email = email
    await User.updateOne({ _id: req.user._id }, update)
    res.render('dashboard', { 
      user: {
        name,
        email
      },
      alert: {
        type: 'success',
        text: 'User information updated.',
      }
    })
  } catch (err) {
    console.error(err)
  }
})

router.post('/change-user-password', ensureAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    await User.updateOne({ _id: req.user._id }, { password: hashedPassword })
    res.render('dashboard', {
      alert: {
        type: 'success',
        text: 'Password changed successfully.',
      }
    })
  } catch (err) {
    console.error(err)
  }
})

router.get('/send-recovery-mail', async (req, res) => { res.render('recoveryMail') })
router.post('/send-recovery-mail', async (req, res) => {
  try {
    const { email } = req.body
    const recoveryKey = uuidv4()
    const user = await User.findOneAndUpdate({ email }, { recoveryKey })
    if (!user) {
      res.render('recoveryMail', {
        alert: { type: 'danger', text: 'User not found!' }
      })
      return
    }
    const { mailerAdress, mailerPass } = JSON.parse(fs.readFileSync('mailer.json', 'utf8'))
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: mailerAdress, // generated ethereal user
        pass: mailerPass // generated ethereal password
      },
      connectionTimeout: 5 * 60 * 1000, // 5 min
    })
    const recoveryUrl = `${req.protocol}://${req.get('host')}/change-password?key=${recoveryKey}`;
    let info = await transporter.sendMail({
      from:  ``, // sender address
      to: email, // list of receivers
      subject: 'Reset Password', // Subject line
      html: `
        <a href="${recoveryUrl}">Click this link to reset your password.</a>
      ` // html body
    })
    req.flash('alert', { type: 'success', text: 'Rescue mail sent.' })
    res.redirect('/login')
  } catch (err) {
    console.error(err)
  }
})

router.get('/change-password', async (req, res) => { res.render('resetPassword') })
router.post('/change-password', async (req, res) => {
  try {
    const { password, confirmPassword } = req.body
    const { key } = req.query
    const user = await User.findOne({ recoveryKey: key })
    if (!user || user.recoveryKey === 'not-valid') {
      res.render('recoveryMail', { alert: { type: 'danger', text: 'Unvalid link!' } })
      return
    }
    if (password !== confirmPassword) {
      res.render('resetPassword', { alert: { type: 'danger', text: 'Password do not match!' } })
      return
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    await User.updateOne({ recoveryKey: key }, { password: hashedPassword, recoveryKey: 'not-valid' })
    res.render('login', {
      alert: {
        type: 'success',
        text: 'Password changed successful.'
      }
    })
  } catch (err) {
    console.error(err)
  }
})


router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body
    const user = {}
    user.email = email
    user.name = name
    user.password = await bcrypt.hash(password, 10)
    await User.create(user)
    res.sendStatus(200)
  } catch (err) {
    console.error(err)
  }
})

router.get('/logout', ensureAuthenticated, (req, res) => {
  req.flash('alert', { type: 'warning', text: 'Session terminated!' })
  res.clearCookie('token')
  res.redirect('/')
})

module.exports = router
