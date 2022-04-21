const router = require('express').Router()
const fs = require('fs')
const nodemailer = require('nodemailer')
const User = require('../models/user')

router.get('/iletisim', (req, res) => {
  fs.readFile('./page/contact.json', 'utf8', (err, page) => {
    if (err) console.error(err)
    const alert = req.flash('alert')[0]
    page = !page ? {} : JSON.parse(page)
    res.render('contact', Object.assign(page, { alert }))
  })
})

router.post('/postaciyi-guncelle', async (req, res) => {
  fs.writeFile('mailler.json', JSON.stringify(req.body), (err) => {
    if (err) console.error(err)
    else res.render('dashboard', { alert: { type: 'success', text: 'Postaci güncellendi' } })
  })
})

router.post('/iletisim', async (req, res) => {
  const { name, email, phone, message } = req.body
  const { maillerAdress, maillerPass } = JSON.parse(fs.readFileSync('mailler.json', 'utf8'))
  const { email: receiver } = (await User.find())[0]
  try {
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

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from:  `"${name}" <${email}>`, // sender address
      to: receiver, // list of receivers
      subject: 'Blog Mesajı', // Subject line
      text: 'Kullanıcı Mesajı', // plain text body
      html: `
      <strong>İsim</strong> ${name}<br/>
      <strong>Email Adresi</strong> ${email}<br/>
      <strong>Telefon Numarası:</strong> ${phone}<br/>
      <br/><br/>
      <div style="max-width: 400px;">
        <strong>Mesaj:</strong> ${message}
      </div>
      ` // html body
    })

    req.flash('alert', { type: 'success', text: 'Mesaj başarılı bir şekilde gönderildi' })
    res.redirect('/iletisim')

    // console.log("Message sent: %s", info.messageId)
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  } catch (err) {
    req.flash('alert', { type: 'danger', text: 'Mesaj gönderilirken bir hata meydana geldi' })
    res.redirect('/iletisim')
    console.error(err)
  }
})

router.get('/iletisim-sayfasini-duzenle', (req, res) => {
  fs.readFile('./page/contact.json', 'utf8', (err, page) => {
    if (err) console.error(err)
    res.render('editContact', !page ? {} : JSON.parse(page))
  })
})

router.post('/iletisim-sayfasini-duzenle', (req, res) => {
  const { title, subtitle, contactDescription } = req.body
  const background = req.files ? req.files.background : undefined
  const backgroundPath = background ? `/backgroundImages/contact.${background.mimetype.replace('image/', '')}` : ''
  fs.readFile('./page/contact.json', 'utf8', (err, page) => {
    if (err) console.error(err)
    page = !page ? {} : JSON.parse(page)
    if (title) page.title = title
    if (subtitle) page.subtitle = subtitle
    if (contactDescription) page.contactDescription = contactDescription
    if (background) {
      fs.unlink(`./public${page.background}`, err => { if(err) console.error(err) })
      page.background = backgroundPath
    }
    fs.writeFile('./page/contact.json', JSON.stringify(page), (err) => {
      if (err) console.error(err)
      if (background) {
        background.mv(`./public${backgroundPath}`, (err) => {
          if (err) console.error(err)
          req.flash('alert', { type: 'success', text: 'Güncelleme Başarılı' })
          res.sendStatus(200)
        })
      } else {
        req.flash('alert', { type: 'success', text: 'Güncelleme Başarılı' })
        res.sendStatus(200)
      }
    })
  })
})

module.exports = router