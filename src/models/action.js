'use strict'

const mongoose = require('mongoose')
const meta = require('./plugins/meta')

const Schema = mongoose.Schema

function actionValueValidate(value) {
  if (value === 'Duty') {
    if (this.action.value == null) {
      return false
    }
  }
  return true
}

const ActionSchema = new Schema({
  name: { type: String, required: [true, '[name] field required'] },
  port: { type: Number, required: [true, '[port] field required'] },
  action: {
    type: {
      type: String,
      required: [true, '[action.type] field required'],
      validate: [actionValueValidate, '[action.value] field required'],
    },
    value: { type: Number },
  },
  duration: { type: Number, required: [true, '[duration] field required'] },
  while: {
    sensor: Number,
    level: Number,
    invert: Boolean,
  },
})

ActionSchema.plugin(meta, true)

module.exports.ActionSchema = ActionSchema
