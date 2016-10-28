'use strict'

const express = require('express')
const templates = require('./templates')
const devices = require('./devices')
const processes = require('./processes')

const router = express.Router()


router.get('/apiCheck', (req, res) => {
  res.send('api is alive')
})

router.use('/templates', templates)
router.use('/devices', devices)
router.use('/processes', processes)

module.exports = router
