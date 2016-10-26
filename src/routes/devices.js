'use strict'

const express = require('express')
const Device = require('../models').Device

const devices = express.Router({ mergeParams: true })

// User ID Parameter Handler
devices.param('uID', (req, res, next, id) => {
  if (req.method === 'POST') {
    req.body.ownedBy = id
    return next()
  }
  Device.find({ ownedBy: id }, (err, doc) => {
    if (err) return next(err)
    if (!doc) {
      const error = new Error('No devices found for user')
      error.status = 404
      return next(error)
    }
    req.device = doc
    return next()
  })
  return null
})

// /GET - All devices by all users, min-data
devices.get('/', (req, res, next) => {
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

// /GET/:uID - All devices ownedBy uID
devices.get('/:uID', (req, res) => {
  res.status = 200
  res.json(req.device)
})

// /POST - Generic Post route, not for users
devices.post('/', (req, res, next) => {
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

// /POST/:uID - Create device ownedBy uID
devices.post('/:uID', (req, res, next) => {
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

// /PUT/:dID - Update device with id tID
devices.put('/:dID', (req, res, next) => {
  const dID = req.params.dID
  Device.findByIdAndUpdate(dID, req.body, { new: true }, (err, result) => {
    if (err) return next(err)
    res.status(200)
    res.json(result)
    return null
  })
})

module.exports = devices
