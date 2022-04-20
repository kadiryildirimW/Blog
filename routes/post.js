const router = require('express').Router()
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const fs = require('fs')
const Post = require('../models/post')

const { ensureAuthenticated } = require('../auth') 

async function normalizePostHandle (title) {
  try {
    let i = 0
    let handle = title.toLowerCase().replace('ı', 'i').replace('ö', 'o').replace('ü', 'u').replace('ş', 's').replace('ç', 'c')
    .replace('ğ', 'g').replace(/\s+/g, '-').replace(/_./g, '-').replace(/\W+/g, '-').replace(/^-/, '').replace(/-$/, '')
    let orgHandle = handle, exist, post
    do {
      post = await Post.findOne({ handle })
      exist = post && post.title !== title
      if (exist) {
        handle = `${orgHandle}-${i}`
        i++
      }
    } while (exist)
    return handle
  } catch (err) {
    console.error(err)
  }
}

router.get('/gonderi-olustur', async (req, res) => {
  try {
    const title = 'Yeni Gönderi'
    const subtitle = 'Alt Başlık'
    const handle = await normalizePostHandle(title)
    const post = await Post.create({ 
      handle,
      title,
      subtitle
    })
    res.redirect(`/gonderi-guncelle?yazi=${handle}`)
  } catch (err) {
    console.error(err)
  }
})

router.get('/gonderi-guncelle', async (req, res) => {
  try {
    const { yazi: handle } = req.query
    const post = await Post.findOne({ handle })
    res.render('postEditor', post)
  } catch (err) {
    console.error(err)
  }
})

router.post('/gonderi-guncelle', async (req, res) => {
  try {
    const update = {}
    const { yazi: handle } = req.query
    const { title, subtitle, content, oldBackgroundPath } = req.body
    if (title) {
      update.title = title
      update.handle = await normalizePostHandle(title)      
    }
    if (subtitle) update.subtitle = subtitle
    if (content) update.content = content
    if (req.files && req.files.background) {
      const img = req.files.background
      const name = uuidv4()
      const ext = img.mimetype.replace('image/', '')
      const link = `backgroundImages/${name}.${ext}`
      await img.mv(path.resolve(path.join('public', link)))
      update.background = link
    }
    await Post.updateOne({ handle }, update)
    res.send(update.handle ? update.handle : handle)
    if (oldBackgroundPath) {
      fs.unlink(path.resolve('public/backgroundImages', oldBackgroundPath), err => { if (err) console.error(err) })
    }
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  } 
})

router.get('/resimler', (req, res) => {
  fs.readdir(path.resolve(path.resolve('public', 'postImages')), (err, files) => {
    if (err) console.error(err)
    res.send(files.map((file) => { return { url: `postImages/${file}` } }))
  })  
})

router.post('/resim-kaydet', async (req, res) => {
  try {
    const img = req.files.file
    const name = uuidv4()
    const ext = img.mimetype.replace('image/', '')
    const link = `postImages/${name}.${ext}`
    await img.mv(path.resolve('public', link))
    res.send({ link })
  } catch (err) {
    res.sendStatus(500)
    console.error(err)
  }
})

router.delete('/resim-sil/:name', async (req, res) => {
  try {
    fs.unlink(path.resolve('public/postImages', req.params.name), (err) => { if (err) console.error(err) })
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
    console.error(err)
  }
})

router.get('/:handle', async (req, res) => {
  try {
    const { handle } = req.params
    const post = await Post.findOne({ handle })
    if (post) {
      res.render('post', post)
    } else {
      res.render('404error')
    }
  } catch (err) {
    console.error(err)
  }
})

module.exports = router