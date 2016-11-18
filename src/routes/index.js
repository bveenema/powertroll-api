'use strict'

const express = require('express')
const templates = require('./templates')
const devices = require('./devices')
const processes = require('./processes')
const sensors = require('./sensors')
const jwt = require('express-jwt')
const guard = require('express-jwt-permissions')({
  requestProperty: 'user',
  permissionsProperty: 'app_metadata.permissions',
})
const getID = require('../middleware/getID')

const router = express.Router()

const jwtCheck = jwt({
  secret: new Buffer(process.env.secret, 'base64'),
  audience: process.env.clientId,
})

router.use(jwtCheck.unless({ path: ['/apiCheck'] }))

router.get('/apiCheck', (req, res) => {
  console.log('alive')
  res.send('api is alive')
})

router.post('/webhookTest', guard.check('particle-cloud'), (req, res) => {
  console.log('webhookTest: ', req.body)
  res.json({ recieved: true })
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
router.use('/sensors', sensors)

module.exports = router
