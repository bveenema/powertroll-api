'use strict'

const express = require('express')
const templates = require('./templates')

const router = express.Router()


router.get('/apiCheck', (req, res) => {
  res.send('api is alive')
})

router.use('/templates', templates)

module.exports = router
