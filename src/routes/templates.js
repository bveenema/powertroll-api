'use strict'

let express   = require('express'),
    templates    = express.Router({mergeParams: true})

let Template= require('../models').Template

templates.param('tID',(req,res,next,id) =>{
  Template.findById(id, (err, doc) => {
    if(err) return next(err)
    if(!doc) {
      err = new Error("Template Not Found")
      err.status = 404
      return next(err)
    }
    req.template = doc
    return next()
  })
})

templates.get('/', (req,res,next) => {
  Template.find({})
          .sort({name: 1})
          .exec((err, templates) => {
  					if(err) return next(err)
            let templatesSimplified = templates.map((template) => {
              return {
                id: template.id,
                name: template.name,
                needsSensorType: template.needsSensorType,
                defaultSettings: template.defaultSettings,
              }
            })
            res.status(200)
  					res.json(templatesSimplified)
  				})
})

templates.get('/detailed', (req,res,next) => {
  Template.find({})
          .sort({name: 1})
          .exec((err, templates) => {
  					if(err) return next(err)
            res.status(200)
  					res.json(templates)
  				})
})

templates.get('/:tID', (req,res,next) => {
  res.status(200)
  res.json(req.template)
})

templates.post('/', (req,res,next) => {
  let template = new Template(req.body)
  template.save((err,template) => {
    if(err) {
      if(err.message === 'Template validation failed') err.status = 200
      return next(err)
    }
    res.status(201)
    res.json(template)
  })
})

templates.put('/:tID', (req,res,next) => {
  req.template.update(req.body, (err, result) => {
    if(err) return next(err)
    res.json(result)
  })
})

module.exports = templates
