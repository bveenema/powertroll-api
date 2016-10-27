'use strict'

const mongoose = require('mongoose')

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
    type: { type: String,
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
  meta: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
})

ActionSchema.virtual('sensors.local').get(() => this.sensors.wired.concat(this.sensors.wireless))

const Action = mongoose.model('Action', ActionSchema)

module.exports.Action = Action
