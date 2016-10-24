'use strict'

let mongoose = require('mongoose')

let Schema = mongoose.Schema

let TemplateSchema = new Schema({
  name: {type: String, required: true},
  needsSensorType: String,
  defaultSettings: {
    loadType: String,
    controlType: String,
    controlMethod: String,
  },
  meta: {
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
  },
})

let Template = mongoose.model('Template', TemplateSchema)

module.exports.Template = Template
