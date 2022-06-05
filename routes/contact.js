const router = require('express').Router()
const fs = require('fs')
const nodemailer = require('nodemailer')
const User = require('../models/user')

const { ensureAuthenticated } = require('../auth') 

router.get('/contact', (req, res) => {
  fs.readFile('./page/contact.json', 'utf8', (err, page) => {
    if (err) console.error(err)
    const alert = req.flash('alert')[0]
    page = !page ? {} : JSON.parse(page)
    res.render('contact', Object.assign(page, { alert }))
  })
})

router.post('/update-mailer', ensureAuthenticated, async (req, res) => {
  fs.writeFile('mailer.json', JSON.stringify(req.body), (err) => {
    if (err) console.error(err)
    else res.render('dashboard', { alert: { type: 'success', text: 'Mailer information updated.' } })
  })
})

router.post('/contact', async (req, res) => {
  const { name, email, phone, message } = req.body
  const { mailerAdress, mailerPass } = JSON.parse(fs.readFileSync('mailer.json', 'utf8'))
  const { email: receiver } = (await User.find())[0]
  try {
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

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from:  `"${name}" <${email}>`, // sender address
      to: receiver, // list of receivers
      subject: 'Blog Message', // Subject line
      text: 'User Message', // plain text body
      html: `
      <strong>Name</strong> ${name}<br/>
      <strong>Email Adress</strong> ${email}<br/>
      <strong>Phone Number:</strong> ${phone}<br/>
      <br/><br/>
      <div style="max-width: 400px;">
        <strong>Message:</strong> ${message}
      </div>
      ` // html body
    })

    req.flash('alert', { type: 'success', text: 'Message send succesfully.' })
    res.redirect('/contact')
  } catch (err) {
    req.flash('alert', { type: 'danger', text: 'Error occurred while sending message.' })
    res.redirect('/contact')
    console.error(err)
  }
})

router.get('/update-contact-page', ensureAuthenticated, (req, res) => {
  fs.readFile('./page/contact.json', 'utf8', (err, page) => {
    if (err) console.error(err)
    res.render('editContact', !page ? {} : JSON.parse(page))
  })
})

router.post('/update-contact-page', ensureAuthenticated, (req, res) => {
  const { title, subtitle, contactDescription } = req.body
  const background = req.files ? req.files.background : undefined
  const backgroundPath = background ? `/images/background/contact.${background.mimetype.replace('image/', '')}` : ''
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
          req.flash('alert', { type: 'success', text: 'Update successful.' })
          res.sendStatus(200)
        })
      } else {
        req.flash('alert', { type: 'success', text: 'Update successful.' })
        res.sendStatus(200)
      }
    })
  })
})

module.exports = router