'use strict'

const express = require('express')
const templates = require('./templates')
const devices = require('./devices')
const processes = require('./processes')
const jwtCheck = require('../../config/express.config').jwtCheck
const guard = require('express-jwt-permissions')({
  requestProperty: 'user',
  permissionsProperty: 'app_metadata.permissions',
})
const getID = require('../middleware/getID')

const router = express.Router()

router.use(jwtCheck.unless({ path: ['/apiCheck'] }))

router.get('/apiCheck', (req, res) => {
  res.send('api is alive')
})

router.get('/authCheck', guard.check('admin'), (req, res) => {
  res.send(`user verified:  ${req.user}`)
})

router.get('/subCheck', guard.check('admin'), getID, (req, res) => {
  const id = req.id
  res.send(`sub: ${id}, typeOf: ${typeof id}`)
})

router.use('/templates', templates)
router.use('/devices', devices)
router.use('/processes', processes)

module.exports = router
