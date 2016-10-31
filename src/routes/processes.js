'use strict'

const express = require('express')
const Process = require('../models').Process

const processes = express.Router({ mergeParams: true })

// /GET - All processes by all users, min-data
processes.get('/', (req, res, next) => {
  Process.find({})
        .sort({ name: 1 })
        .exec((err, Processes) => {
          if (err) return next(err)
          const ProcessesSimplified = Processes.map((process) => {
            const returnVal = {
              // [id, name, {control}, numActions, updatedAt]
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

// GET /process-:pID - Returns the Process specified by pID with all fields
processes.get('/process-:pID', (req, res, next) => {
  const pID = req.params.pID
  Process.findById(pID, (err, result) => {
    if (err) return next(err)
    res.status(200)
    res.json(result)
    return null
  })
})

// GET /:uID - Returns the Processes owned by uID with all fields
processes.get('/:uID', (req, res, next) => {
  const uID = req.params.uID
  Process.find({ ownedBy: uID })
          .sort({ name: -1 })
          .exec((err, Processes) => {
            if (err) return next(err)
            res.status(200)
            res.json(Processes)
            return null
          })
})

// POST / - Creates a Process, not for general use (use POST /:uID)
processes.post('/', (req, res, next) => {
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

// POST /:uID - Creates a Process ownedBy uID
processes.post('/:uID', (req, res, next) => {
  req.body.ownedBy = req.params.uID
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

// PUT /:pID - Updates a Process specified by pID
processes.put('/:pID', (req, res, next) => {
  const pID = req.params.pID
  Process.findById(pID, (err, doc) => {
    if (err) return next(err)
    doc.update(req.body, (error, result) => {
      if (err) return next(err)
      res.status(200)
      res.json(result)
      return null
    })
    return null
  })
})

module.exports = processes
