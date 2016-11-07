'use strict'

const express = require('express')
const Sensor = require('../models').Sensor
const guard = require('express-jwt-permissions')({
  requestProperty: 'user',
  permissionsProperty: 'app_metadata.permissions',
})
const getID = require('../middleware/getID')

const sensors = express.Router({ mergeParams: true })

// GET - Retrieve all devices owned by the user
sensors.get('/', guard.check('user'), getID, (req, res, next) => {
  Sensor.findByOwner(req.id, { name: -1 }, (err, docs) => {
    if (err) return next(err)
    res.status(200)
    res.json(docs)
    return null
  })
})
// GET/all - Retrieve all devices in db, min-data
// POST - Create a device owned by the user
sensors.post('/', guard.check('user'), getID, (req, res, next) => {
  const s = new Sensor()
  s.saveOwner(req.body, req.id, (err, doc) => {
    if (err) {
      if (err.message === 'Device validation failed') err.status = 200
      return next(err)
    }
    res.status(201)
    res.json(doc)
    return null
  })
})
// POST/all - Create a device, not for general user (see POST)
// PUT/:sID - Update a device given by sID
// DELETE/:sID - Delete a device given by sID

module.exports = sensors
