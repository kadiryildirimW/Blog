const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const nodemailer = require('nodemailer')
const User = require('../models/user')
const { v4: uuidv4 } = require('uuid');

router.get('/giris', (req, res) => { 
  const alert = req.flash('alert')[0]
  res.render('login', { alert })
})

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
      req.flash('alert', { text: 'Giriş başarılı.', type: 'success' })
      req.flash('email', email)
      res.redirect('/')
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

router.get('/kurtarma-postasi-gonder', async (req, res) => { res.render('recoveryMail') })
router.post('/kurtarma-postasi-gonder', async (req, res) => {
  try {
    const { email } = req.body
    const recoveryKey = uuidv4()
    const user = await User.findOneAndUpdate({ email }, { recoveryKey })
    if (!user) {
      res.render('recoveryMail', {
        alert: { type: 'danger', text: 'Kayıtlı mail adresi bulunamadı' }
      })
      return
    }
    const { maillerAdress, maillerPass } = JSON.parse(fs.readFileSync('mailler.json', 'utf8'))
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: maillerAdress, // generated ethereal user
        pass: maillerPass // generated ethereal password
      },
      connectionTimeout: 5 * 60 * 1000, // 5 min
    })
    const recoveryUrl = `${req.protocol}://${req.get('host')}/sifreyi-sifirla?anahtar=${recoveryKey}`;
    let info = await transporter.sendMail({
      from:  ``, // sender address
      to: email, // list of receivers
      subject: 'Şifre Sıfırlama', // Subject line
      html: `
        <a href="${recoveryUrl}">Şifreni sıfırlamak için bu linke tıkla</a>
      ` // html body
    })
    req.flash('alert', { type: 'success', text: 'Kurtarma maili gönderildi' })
    res.redirect('/giris')
  } catch (err) {
    console.error(err)
  }
})

router.get('/sifreyi-sifirla', async (req, res) => { res.render('resetPassword') })
router.post('/sifreyi-sifirla', async (req, res) => {
  try {
    const { password, confirmPassword } = req.body
    const { anahtar: key } = req.query
    const user = await User.findOne({ recoveryKey: key })
    if (!user || user.recoveryKey === 'not-valid') {
      res.render('recoveryMail', { alert: { type: 'danger', text: 'Geçersiz link' } })
      return
    }
    console.log(password, confirmPassword)
    if (password !== confirmPassword) {
      res.render('resetPassword', { alert: { type: 'danger', text: 'Şifreler uyuşmuyor' } })
      return
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    await User.updateOne({ recoveryKey: key }, { password: hashedPassword, recoveryKey: 'not-valid' })
    res.render('login', {
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
  } catch (err) {
    console.error(err)
  }
})

router.get('/cikis-yap', (req, res) => {
  req.flash('alert', { type: 'success', text: 'Oturum sonlandırıldı' })
  res.clearCookie('token')
  res.redirect('/')
})

module.exports = router
