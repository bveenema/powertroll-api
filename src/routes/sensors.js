'use strict'

const express = require('express')
const dataManager = require('../app/dataManager')
const Sensor = require('../models').Sensor
const guard = require('express-jwt-permissions')({
  requestProperty: 'user',
  permissionsProperty: 'app_metadata.permissions',
})
const getID = require('../middleware/getID')
const times = require('lodash.times')
const moment = require('moment')

const sensors = express.Router({ mergeParams: true })

sensors.param('sID', (req, res, next, sID) => {
  getID(req, res)
  Sensor.findByIdCheckOwner(sID, req.id, (err, doc) => {
    if (err) return next(err)
    req.sensor = doc
    return next()
  })
})

// GET - Retrieve all devices owned by the user
sensors.get('/', guard.check('user'), getID, (req, res, next) => {
  console.log('get sensor')
  Sensor.findByOwner(req.id, { name: -1 }, (err, docs) => {
    if (err) return next(err)
    res.status(200)
    res.json(docs)
    return null
  })
})

// GET/all - Retrieve all devices in db, min-data
sensors.get('/all', guard.check('admin'), (req, res, next) => {
  Sensor.find({})
        .select({
          id: 1,
          type: 1,
          connectionStatus: 1,
          'dataMeta.type': 1,
          'dataMeta.unit': 1,
          'dataMeta.color': 1,
          updateAt: 1,
        })
        .sort({ name: 1 })
        .exec((err, sen) => {
          if (err) return next(err)
          res.status(200)
          res.json(sen)
          return null
        })
})

// POST - Create a device owned by the user
sensors.post('/', guard.check('user'), getID, (req, res, next) => {
  const s = new Sensor()
  delete req.body.lastDate
  delete req.body.lastValue
  delete req.body.segmentId
  delete req.body.pointer
  delete req.body.seriesId
  s.saveOwner(req.body, req.id, (err, doc) => {
    if (err) {
      if (err.message === 'Device validation failed') err.status = 200
      return next(err)
    }
    dataManager.newSensor(doc.id, req.id, (error) => {
      if (error) return next(error)
      res.status(201)
      res.json(doc)
      return null
    })
    return null
  })
})

// POST/all - Create a device, not for general user (see POST)
sensors.post('/all', guard.check('tech'), (req, res, next) => {
  const s = new Sensor(req.body)
  s.save((err, doc) => {
    if (err) {
      if (err.message === 'Device validation failed') err.status = 200
      return next(err)
    }
    dataManager.newSensor(doc.id, req.id, (error) => {
      if (error) return next(error)
      res.status(201)
      res.json(doc)
      return null
    })
    return null
  })
})

// PUT/:sID - Update a device given by sID
sensors.put('/:sID', guard.check('user'), (req, res, next) => {
  req.sensor.update(req.body, (err, doc) => {
    if (err) return next(err)
    res.status(200)
    res.json(doc)
    return null
  })
})

// DELETE/:sID - Delete a device given by sID
sensors.delete('/:sID', guard.check('user'), (req, res, next) => {
  req.sensor.remove((err, removed) => {
    if (err) return next(err)
    res.status(200)
    res.json(removed)
    return null
  })
})

sensors.post('/data', guard.check('user'), getID, (req, res) => {
  const dataPacket = Object.assign({}, req.body, { ownedBy: req.id })
  const response = dataManager.recieveData(dataPacket)
  if (response) res.status(202)
  else res.status(400)
  res.send(response)
  return null
})

sensors.get('/data/:sID', guard.check('user'), getID, (req, res, next) => {
  const startDate = parseInt(req.query.start, 10)
  const stopDate = parseInt(req.query.stop, 10)

  dataManager.getQuery(req.sensor.seriesId, startDate, stopDate, (err, data) => {
    if (err) return next(err)
    res.status(200)
    res.json(data)
    return null
  })
})

sensors.get('/seed', guard.check('admin'), getID, (req, res) => {
  // create mock data
  const mockData = times(20, (i) => {
    return {
      time: moment().add(i, 'minutes').valueOf(),
      value: i * 10,
    }
  })
  console.log('mockData: ', mockData)

  // create a sensor
  const mockSensor = {
    type: 'foo',
    connectionStatus: {
      wireless: 'foo',
    },
    dataMeta: {
      type: 'foo',
      unit: 'foo',
    },
  }
  const s = new Sensor()
  s.saveOwner(mockSensor, req.id, (err, doc) => {
    if (err) {
      console.log('err: ', err)
    }
    dataManager.newSensor(doc.id, req.id, (error) => {
      if (error) console.log('DM Error: ', error)
      // wait for sensor to store
      setTimeout(() => {
        let i = 0
        const handle = setInterval(() => {
          const dataPacket = Object.assign(
            {},
            { sID: doc.id },
            mockData[i],
            { ownedBy: req.id }
          )
          const didWork = dataManager.recieveData(dataPacket)
          console.log(`data, ${mockData[i]} saved: ${didWork}, ${i}`)
          i += 1
          if (i >= 20) clearInterval(handle)
        }, 200)
      }, 200)
    })
  })
  // store data

  res.status(200)
  res.send(true)
})

module.exports = sensors
