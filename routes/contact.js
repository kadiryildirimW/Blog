const router = require('express').Router()
const fs = require('fs')

router.get('/iletisim', (req, res) => {
  fs.readFile('./page/contact.json', 'utf8', (err, page) => {
    if (err) console.error(err)
    res.render('contact', !page ? {} : JSON.parse(page))
  })
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
          res.sendStatus(200)
        })
      } else {
        res.sendStatus(200)
      }
    })
  })
})

module.exports = router