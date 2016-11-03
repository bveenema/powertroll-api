'use strict'

const express = require('express')
const Template = require('../models').Template
const guard = require('express-jwt-permissions')({
  requestProperty: 'user',
  permissionsProperty: 'app_metadata.permissions',
})

const templates = express.Router({ mergeParams: true })


templates.get('/', guard.check('user'), (req, res, next) => {
  Template.find({})
          .sort({ name: 1 })
          .exec((err, Templates) => {
            if (err) return next(err)
            const TemplatesSimplified = Templates.map((template) => {
              const returnVal = {
                id: template.id,
                name: template.name,
                needsSensorType: template.needsSensorType,
                defaultSettings: template.defaultSettings,
              }
              return returnVal
            })
            res.status(200)
            res.json(TemplatesSimplified)
            return null
          })
})

templates.get('/detailed', guard.check('user'), (req, res, next) => {
  Template.find({})
          .sort({ name: 1 })
          .exec((err, Templates) => {
            if (err) return next(err)
            res.status(200)
            res.json(Templates)
            return null
          })
})


templates.get('/:tID', (req, res, next) => {
  const tID = req.params.tID
  Template.findById(tID, (err, doc) => {
    if (err) return next(err)
    if (!doc) {
      const error = new Error('Template Not Found')
      error.status = 404
      return next(error)
    }
    res.status(200)
    res.json(doc)
    return null
  })
})

templates.post('/', guard.check('tech'), (req, res, next) => {
  const template = new Template(req.body)
  template.save((err, temp) => {
    if (err) {
      if (err.message === 'Template validation failed') err.status = 200
      return next(err)
    }
    res.status(201)
    res.json(temp)
    return null
  })
})

templates.put('/:tID', (req, res, next) => {
  const tID = req.params.tID
  Template.findByIdAndUpdate(tID, req.body, { new: true }, (err, result) => {
    if (err) return next(err)
    res.status(200)
    res.json(result)
    return null
  })
})

module.exports = templates
