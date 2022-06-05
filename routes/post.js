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
    const orgHandle = handle
    let exist, posts
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

router.get('/search-post', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5
    const page = req.query.page ? parseInt(req.query.page) : 1
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

router.get('/create-post', async (req, res) => {
  try {
    const title = 'New Post'
    const subtitle = 'Subtitle'
    const author = req.user._id 
    const handle = await normalizePostHandle(title)
    await Post.create({
      handle,
      title,
      subtitle,
      author
    })
    res.redirect(`/update-post?article=${handle}`)
  } catch (err) {
    console.error(err)
  }
})

router.get('/update-post', ensureAuthenticated, async (req, res) => {
  try {
    const { article: handle } = req.query
    const post = await Post.findOne({ handle })
    if (post) {
      post.date = post.createdAt.fitDate()
      res.render('postEditor', { post })
    } else {
      res.render('404error')
    }
  } catch (err) {
    console.error(err)
  }
})

router.post('/update-post', ensureAuthenticated, async (req, res) => {
  try {
    const update = {}
    const { article: handle } = req.query
    const { title, subtitle, content, oldBackgroundPath } = req.body
    if (title && title.trim()) {
      update.title = title
      update.handle = await normalizePostHandle(title, handle)      
    }
    if (subtitle) update.subtitle = subtitle
    if (content) update.content = content
    if (req.files && req.files.background) {
      const img = req.files.background
      const name = uuidv4()
      const ext = img.mimetype.replace('image/', '')
      const link = `images/background/${name}.${ext}`
      await img.mv(path.resolve(path.join('public', link)))
      update.background = link
    }
    await Post.updateOne({ handle }, update)
    req.flash('alert', { type: 'success', text: 'Update successful.' })
    res.send(update.handle === undefined ? handle : update.handle)
    if (oldBackgroundPath) {
      fs.unlink(path.resolve('public/images/background', oldBackgroundPath), err => { if (err) console.error(err) })
    }
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  } 
})

router.get('/images', ensureAuthenticated, (req, res) => {
  fs.readdir(path.resolve(path.resolve('public', 'images/post')), (err, files) => {
    if (err) console.error(err)
    res.send(files.map((file) => { return { url: `images/post/${file}` } }))
  })  
})

router.post('/save-image', ensureAuthenticated, async (req, res) => {
  try {
    const img = req.files.file
    const name = uuidv4()
    const ext = img.mimetype.replace('image/', '')
    const link = `images/post/${name}.${ext}`
    await img.mv(path.resolve('public', link))
    res.send({ link })
  } catch (err) {
    res.sendStatus(500)
    console.error(err)
  }
})
router.delete('/delete-image', ensureAuthenticated, (req, res) => {
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

router.get('/manage-posts', ensureAuthenticated, (req, res) => { res.render('managePost') })
router.patch('/hide-post', ensureAuthenticated, async (req, res) => {
  try {
    const { article: handle } = req.query
    await Post.updateOne({ handle }, { public: false })
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
    console.error(err)
  }
})
router.patch('/publish-post', ensureAuthenticated, async (req, res) => {
  try {
    const { article: handle } = req.query
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
      post.date = post.createdAt.fitDate()
      res.render('post', { post, alert })
    } else {
      res.render('404error')
    }
  } catch (err) {
    console.error(err)
  }
})

router.delete('/:handle', ensureAuthenticated, async (req, res) => {
  try {
    const { handle } = req.params
    await Post.deleteOne({ handle })
    req.flash('alert', { type: 'success', text: 'Post deleted.' })
    res.sendStatus(200)
  } catch (err) {
    console.error(err)
  }
})

module.exports = router