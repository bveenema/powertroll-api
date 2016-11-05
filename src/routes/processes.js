'use strict'

const express = require('express')
const Process = require('../models').Process
const guard = require('express-jwt-permissions')({
  requestProperty: 'user',
  permissionsProperty: 'app_metadata.permissions',
})
const getID = require('../middleware/getID')

const processes = express.Router({ mergeParams: true })

processes.param('pID', (req, res, next, pID) => {
  getID(req, res)
  Process.findByIdCheckOwner(pID, req.id, (err, doc) => {
    if (err) return next(err)
    req.process = doc
    return next()
  })
})

processes.param('aID', (req, res, next, aID) => {
  req.action = req.process.actions.id(aID)
  if (!req.action) {
    const err = new Error('Not Found')
    err.status = 404
    return next(err)
  }
  return next()
})

// /GET/all - All processes by all users, min-data
processes.get('/all', guard.check('admin'), (req, res, next) => {
  Process.find({})
        .sort({ name: 1 })
        .exec((err, Processes) => {
          if (err) return next(err)
          const ProcessesSimplified = Processes.map((process) => {
            const returnVal = {
              id: process.id,
              name: process.name,
              control: process.control,
              numActions: process.actions.length,
              updatedAt: process.meta.updatedAt,
            }
            return returnVal
          })
          res.status(200)
          res.json(ProcessesSimplified)
          return null
        })
})

// GET /:pID - Returns the Process specified by pID with all fields
processes.get('/:pID', guard.check('user'), (req, res) => {
  res.status(200)
  res.json(req.process)
  return null
})

// GET / - Returns the Processes owned by the user with all fields
processes.get('/', guard.check('user'), getID, (req, res, next) => {
  Process.findByOwner(req.id, { name: -1 }, (err, Processes) => {
    if (err) return next(err)
    res.status(200)
    res.json(Processes)
    return null
  })
})

// POST / - Creates a Process, not for general use (use POST /:uID)
processes.post('/all', guard.check('tech'), (req, res, next) => {
  const process = new Process(req.body)
  process.save((err, result) => {
    if (err) {
      if (err.message === 'Device validation failed') err.status = 200
      return next(err)
    }
    res.status(201)
    res.json(result)
    return null
  })
})

// POST / - Creates a Process ownedBy uID
processes.post('/', guard.check('user'), getID, (req, res, next) => {
  const process = new Process()
  process.saveOwner(req.body, req.id, (err, result) => {
    if (err) {
      if (err.message === 'Device validation failed') err.status = 200
      return next(err)
    }
    res.status(201)
    res.json(result)
    return null
  })
})

// PUT /:pID - Updates a Process specified by pID
processes.put('/:pID', guard.check('user'), (req, res, next) => {
  req.process.update(req.body, (err, result) => {
    if (err) return next(err)
    res.status(200)
    res.json(result)
    return null
  })
})

// GET /:pID/action
processes.get('/:pID/actions', guard.check('user'), (req, res) => {
  res.status(200)
  res.json(req.process.actions)
  return null
})

// POST /:pID/action
processes.post('/:pID/actions', guard.check('user'), (req, res, next) => {
  req.process.actions.push(req.body)
  req.process.save((err, result) => {
    if (err) {
      if (err.message === 'Device validation failed') err.status = 200
      return next(err)
    }
    res.status(201)
    res.json(result.actions)
    return null
  })
})

// PUT /:pID/action/:aID
processes.put('/:pID/actions/:aID', guard.check('user'), (req, res, next) => {
  req.action.update(req.body, (err, result) => {
    if (err) {
      if (err.message === 'Device validation failed') err.status = 200
      return next(err)
    }
    res.status(200)
    res.json(result.actions)
    return null
  })
})

// DELETE /:pID/action/:aID
processes.delete('/:pID/actions/:aID', guard.check('user'), getID, (req, res, next) => {
  req.action.remove(() => {
    req.process.update(null, (err, result) => {
      if (err) return next(err)
      res.status(200)
      res.json(result)
      return null
    })
  })
})

module.exports = processes
