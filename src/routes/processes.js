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

// GET /:pID - Returns the Process specified by pID with all fields

// GET /:uID - Returns the Processes owned by uID with all fields

// POST / - Creates a Process, not for general use (use POST /:uID)

// POST /:uID - Creates a Process ownedBy uID

// PUT /:pID - Updates a Process specified by pID
processes.put('/:pID', (req, res, next) => {
  const pID = req.params.pID
  Process.findByIdAndUpdate(pID, req.body, { new: true }, (err, result) => {
    if (err) return next(err)
    res.status(200)
    res.json(result)
    return null
  })
})

module.exports = processes
