const router = require('express').Router()

const { ensureAuthenticated } = require('../auth') 

router.get('/dashboard', ensureAuthenticated, (req, res) =>  {
  res.render('dashboard')
})

module.exports = router
