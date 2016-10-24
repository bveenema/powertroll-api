'use strict'

let express   = require('express'),
    router    = express.Router(),
    templates = require('./templates')


router.get('/apiCheck', (req,res,next) => {
  res.send('api is alive')
})

router.use('/templates',templates)

module.exports = router
