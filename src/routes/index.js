'use strict'

const express = require('express')
const templates = require('./templates')
const devices = require('./devices')
const jwtCheck = require('../../config/express.config').jwtCheck
const guard = require('express-jwt-permissions')({
  requestProperty: 'user',
  permissionsProperty: 'app_metadata.permissions',
})

const router = express.Router()

router.use(jwtCheck.unless({ path: ['/apiCheck'] }))

router.get('/apiCheck', (req, res) => {
  console.log('user: ', req.user)
  res.send('api is alive')
})

router.get('/authCheck', guard.check('admin'), (req, res) => {
  console.log('user: ', req.user)
  res.send('user verified')
})

router.use('/templates', templates)

router.use('/devices', devices)

module.exports = router
