const router = require('express').Router()
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const fs = require('fs')
const Post = require('../models/post')

const { ensureAuthenticated } = require('../auth') 

async function normalizePostHandle (title, oldHandle) {
  try {
    let i = 0
    let handle = title.toLowerCase().replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c')
    .replace(/ğ/g, 'g').replace(/\s+/g, '-').replace(/_./g, '-').replace(/\W+/g, '-').replace(/^-/, '').replace(/-$/, '')
    let orgHandle = handle, exist, post
    do {
      posts = await Post.find({ handle })
      if (posts.length > 0 && posts[0].handle !== oldHandle) {
        handle = `${orgHandle}-${i}`
        i++
        exist = true
      } else {
        exist = false
      }
    } while (exist)
    return handle
  } catch (err) {
    console.error(err)
  }
}

function normalizeHandle (str) { return str.toLowerCase().replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/\s+/g, '-').replace(/_./g, '-').replace(/\W+/g, '-').replace(/^-/, '').replace(/-$/, '') }

router.get('/gonderiyi-getir', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5
    const page = req.query.sayfa ? parseInt(req.query.sayfa) : 1
    const search = req.query.ara ? normalizeHandle(req.query.ara) : null
    const query = {}
    if (!req.user) query.public = true
    if (search) query.handle = { $regex: new RegExp(search) }
    const result = await Post.paginate(
      query,
      { 
        page,
        limit,
        sort: { createdAt: -1 },
        populate: 'author',
        select: 'title author subtitle handle createdAt'
      }
    )
    result.docs = result.docs.map(post => { 
      return { 
        date: new Date(post.createdAt).fitDate(),
        author: { name: post.author.name },
        title: post.title,
        subtitle: post.subtitle,
        handle: post.handle
      }
    })
    res.send(result)
  } catch (err) {
    console.error(err)
  }
})

router.get('/gonderi-olustur', async (req, res) => {
  try {
    const title = 'Yeni Gönderi'
    const subtitle = 'Alt Başlık'
    const author = req.user._id 
    const handle = await normalizePostHandle(title)
    const post = await Post.create({ 
      handle,
      title,
      subtitle,
      author
    })
    res.redirect(`/gonderiyi-guncelle?yazi=${handle}`)
  } catch (err) {
    console.error(err)
  }
})

router.get('/gonderiyi-guncelle', async (req, res) => {
  try {
    const { yazi: handle } = req.query
    const post = await Post.findOne({ handle })
    if (post) {
      res.render('postEditor', post)
    } else {
      res.render('404error')
    }
  } catch (err) {
    console.error(err)
  }
})
router.post('/gonderiyi-guncelle', async (req, res) => {
  try {
    const update = {}
    const { yazi: handle } = req.query
    const { title, subtitle, content, oldBackgroundPath } = req.body
    if (title) {
      update.title = title
      update.handle = await normalizePostHandle(title, handle)      
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
    req.flash('alert', { type: 'success', text: 'Güncelleme Başarılı' })
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
router.post('/video-kaydet', async (req, res) => {
  try {
    console.log(req.body, req.files)
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
router.delete('/resim-sil', (req, res) => {
  const { src } = req.body
  fs.unlink(`public/${src}`, (err) => {
    if (err) {
      res.sendStatus(500)
      console.error(err)
    } else {
      res.sendStatus(200)
    }
  })
})

router.get('/gonderileri-yonet', (req, res) => { res.render('managePost') })
router.patch('/gonderiyi-gizle', async (req, res) => {
  try {
    const { yazi: handle } = req.query
    await Post.updateOne({ handle }, { public: false })
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
    console.error(err)
  }
})
router.patch('/gonderiyi-yayina-al', async (req, res) => {
  try {
    const { yazi: handle } = req.query
    await Post.updateOne({ handle }, { public: true })
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
      const alert = req.flash('alert')[0]
      res.render('post', Object.assign(post, { alert }))
    } else {
      res.render('404error')
    }
  } catch (err) {
    console.error(err)
  }
})

module.exports = router