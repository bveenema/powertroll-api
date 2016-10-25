'use strict'

const express = require('express')
const Template = require('../models').Template

const templates = express.Router({ mergeParams: true })

templates.param('tID', (req, res, next, id) => {
  Template.findById(id, (err, doc) => {
    if (err) return next(err)
    if (!doc) {
      const error = new Error('Template Not Found')
      error.status = 404
      return next(error)
    }
    req.template = doc
    return next()
  })
})

templates.get('/', (req, res, next) => {
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

templates.get('/detailed', (req, res, next) => {
  Template.find({})
          .sort({ name: 1 })
          .exec((err, Templates) => {
            if (err) return next(err)
            res.status(200)
            res.json(Templates)
            return null
          })
})

templates.get('/:tID', (req, res) => {
  res.status(200)
  res.json(req.template)
})

templates.post('/', (req, res, next) => {
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
  req.template.update(req.body, (err, result) => {
    if (err) return next(err)
    res.json(result)
    return null
  })
})

module.exports = templates
