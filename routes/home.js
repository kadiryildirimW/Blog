const router = require('express').Router()
const fs = require('fs')

router.get('/', (req, res) => {
  fs.readFile('./page/home.json', 'utf8', (err, page) => {
    if (err) console.error(err)
    const alert = req.flash('alert')[0]
    page = !page ? {} : JSON.parse(page)
    res.render('home', Object.assign(page, { alert }))
  })
})

router.get('/anasayfayi-duzenle', (req, res) => {
  fs.readFile('./page/home.json', 'utf8', (err, page) => {
    if (err) console.error(err)
    res.render('editHome', !page ? {} : JSON.parse(page))
  })
})

router.post('/anasayfayi-duzenle', (req, res) => {
  const { title, subtitle } = req.body
  const background = req.files ? req.files.background : undefined
  const backgroundPath = background ? `/backgroundImages/home.${background.mimetype.replace('image/', '')}` : ''
  fs.readFile('./page/home.json', 'utf8', (err, page) => {
    if (err) console.error(err)
    page = !page ? {} : JSON.parse(page)
    if (title) page.title = title
    if (subtitle) page.subtitle = subtitle
    if (background) {
      fs.unlink(`./public${page.background}`, err => { if(err) console.error(err) })
      page.background = backgroundPath
    }
    fs.writeFile('./page/home.json', JSON.stringify(page), (err) => {
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