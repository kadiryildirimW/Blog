const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

router.get('/giris', (req, res) => { res.render('login') })

router.post('/giris', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      res.render('login', {
        alert: { text: 'Kullanıcı bulunamadı, emailinizi kontrol edin!', type: 'danger' },
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
      res.render('login', {
        alert: { text: 'Giriş başarılı.', type: 'success' },
        email
      })
    } else {
      res.render('login', {
        alert: { text: 'Yanlış şifre.', type: 'danger' },
        email
      })
    }
  } catch (err) {
    console.error(err)
  }
})

router.post('/kullanici-verisini-guncelle', async (req, res) => {
  try {
    const { name, email, contactEmail, contactPass } = req.body
    const update = {}
    if (contactPass.trim() !== '') update.contactPass = contactPass
    update.name = name
    update.email = email
    update.contactEmail = contactEmail
    await User.updateOne({ _id: req.user._id }, update)
    res.render('dashboard', { 
      user: {
        name,
        email,
        contactEmail
      },
      alert: {
        type: 'success',
        text: 'Kullanıcı verisi güncellendi',
      }
    })
  } catch (err) {
    console.error(err)
  }
})

router.post('/kullanici-sifresini-degistir', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    await User.updateOne({ _id: req.user._id }, { password: hashedPassword })
    res.render('dashboard', {
      alert: {
        type: 'success',
        text: 'Şifre başarılı bir şekilde değiştirildi',
      }
    })
  } catch (err) {
    console.error(err)
  }
})


router.post('/kayit' , async (req, res) => {
  try {
    const { email, password, name } = req.body
    const user = {}
    user.email = email
    user.name = name
    user.password = await bcrypt.hash(password, 10)
    await User.create(user)
    console.log('user register')
  } catch (err) {
    console.error(err)
  }
})

router.get('/cikis-yap', (req, res) => {
  req.flash('alert', { type: 'success', text: 'Oturum sonlandırıldı' })
  res.redirect('/')
})

module.exports = router
