'use strict'

const express = require('express')
const Device = require('../models').Device
const guard = require('express-jwt-permissions')({
  requestProperty: 'user',
  permissionsProperty: 'app_metadata.permissions',
})
const getID = require('../middleware/getID')

const devices = express.Router({ mergeParams: true })

// /GET/all - All devices by all users, min-data
devices.get('/all', guard.check('admin'), (req, res, next) => {
  Device.find({})
        .sort({ name: 1 })
        .exec((err, Devices) => {
          if (err) return next(err)
          const DevicesSimplified = Devices.map((device) => {
            const returnVal = {
              id: device.id,
              name: device.name,
              type: device.type,
              firmware: device.firmware,
              numSensors: device.sensors.wired.length +
                          device.sensors.wireless.length +
                          device.sensors.network.length,
            }
            return returnVal
          })
          res.status(200)
          res.json(DevicesSimplified)
          return null
        })
})

// /GET - All devices ownedBy uID
devices.get('/', guard.check('user'), getID, (req, res, next) => {
  Device.findByOwner(req.id, (err, docs) => {
    if (err) return next(err)
    res.status(200)
    res.json(docs)
    return null
  })
})

// /POST/all - Generic Post route, not for users
devices.post('/all', guard.check('admin'), (req, res, next) => {
  const device = new Device(req.body)
  device.save((err, d) => {
    if (err) {
      if (err.message === 'Device validation failed') err.status = 200
      return next(err)
    }
    res.status(201)
    res.json(d)
    return null
  })
})

// /POST/ - Create device ownedBy user id
devices.post('/', guard.check('user'), getID, (req, res, next) => {
  const device = new Device(Object.assign({}, req.body, { ownedBy: req.id }))
  device.save((err, d) => {
    if (err) {
      if (err.message === 'Device validation failed') err.status = 200
      return next(err)
    }
    res.status(201)
    res.json(d)
    return null
  })
})

// /PUT/:dID - Update device with id tID
devices.put('/:dID', guard.check('user'), getID, (req, res, next) => {
  const dID = req.params.dID
  Device.findByIdCheckOwner(dID, req.id, (err, doc) => {
    if (err) return next(err)
    doc.update(req.body, (error, result) => {
      res.status(200)
      res.json(result)
    })
    return null
  })
})

module.exports = devices
