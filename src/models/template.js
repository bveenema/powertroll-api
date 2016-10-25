const mongoose = require('mongoose')

const Schema = mongoose.Schema

const TemplateSchema = new Schema({
  name: { type: String, required: true },
  needsSensorType: String,
  defaultSettings: {
    loadType: String,
    controlType: String,
    controlMethod: String,
  },
  meta: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
})

const Template = mongoose.model('Template', TemplateSchema)

module.exports.Template = Template
