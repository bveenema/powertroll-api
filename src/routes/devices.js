'use strict'

const express = require('express')
const Device = require('../models').Device

const devices = express.Router({ mergeParams: true })

// User ID Parameter Handler
devices.param('uID', (req, res, next, id) => {
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
})

// Device ID Parameter Handler
devices.param('dID', (req, res, next, id) => {
  Device.findById(id, (err, doc) => {
    if (err) return next(err)
    if (!doc) {
      const error = new Error('Device Not Found')
      error.status = 404
      return next(error)
    }
    req.device = doc
    return next()
  })
})


// /GET - All devices by all users, min-data

// /GET/:uID - All devices ownedBy uID

// /POST - Generic Post route, not for users

// /POST/:uID - Create device ownedBy uID

// /PUT/:dID - Update device with id tID

module.exports = devices
