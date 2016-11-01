'use strict'

const express = require('express')
const templates = require('./templates')
const devices = require('./devices')
const jwtCheck = require('../../config/express.config').jwtCheck

const router = express.Router()

router.use('/authCheck', jwtCheck)

router.get('/apiCheck', (req, res) => {
  console.log('user: ', req.user)
  res.send('api is alive')
})

router.get('/authCheck', (req, res) => {
  console.log('user: ', req.user)
  res.send('user verified')
})

router.use('/templates', templates)

router.use('/devices', devices)

module.exports = router
