const router = require('express').Router()

router.get('/admin-paneli', (req, res) =>  {
  res.render('dashboard')
})

module.exports = router
