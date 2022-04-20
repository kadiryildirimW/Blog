const router = require('express').Router()
const fs = require('fs')

router.get('/hakkimda', (req, res) => { 
  fs.readFile('./page/about.json', 'utf8', (err, page) => {
    if (err) console.error(err)
    res.render('about', !page ? {} : JSON.parse(page))
  })
})

router.get('/hakkimda-sayfasini-duzenle', (req, res) => { 
  fs.readFile('./page/about.json', 'utf8', (err, page) => {
    if (err) console.error(err)
    res.render('editAbout', !page ? {} : JSON.parse(page))
  })
})


router.post('/hakkimda-sayfasini-duzenle', (req, res) => {
  const { title, subtitle, content } = req.body
  const background = req.files ? req.files.background : undefined
  const backgroundPath = background ? `/backgroundImages/about.${background.mimetype.replace('image/', '')}` : ''
  fs.readFile('./page/about.json', 'utf8', (err, page) => {
    if (err) console.error(err)
    page = !page ? {} : JSON.parse(page)
    if (title) page.title = title
    if (subtitle) page.subtitle = subtitle
    if (content) page.content = content
    if (background) {
      fs.unlink(`./public${page.background}`, err => { if(err) console.error(err) })
      page.background = backgroundPath
    }
    fs.writeFile('./page/about.json', JSON.stringify(page), (err) => {
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