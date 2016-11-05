'use strict'

const mongoose = require('mongoose')
const meta = require('./plugins/meta')
const owner = require('./plugins/owner')
const ActionSchema = require('./action').ActionSchema

const Schema = mongoose.Schema

function checkSensor(value) {
  return value.length > 0
}

const ProcessSchema = new Schema({
  name: { type: String, required: [true, '[name] field required'] },
  device: {
    id: { type: Number, required: [true, '[device.id] field required'] },
    port: { type: Number, required: [true, '[device.port] field required'] },
  },
  sensors: { type: [Number], validate: [checkSensor, '[sensors] field required'] },
  loadType: { type: String, required: [true, '[loadType] field required'] },
  control: {
    type: { type: String, required: [true, '[control.type] field required'] },
    method: { type: String, required: [true, '[control.method] field required'] },
    value: { type: Number, required: [true, '[control.value] field required'] },
  },
  actions: [ActionSchema],
})

ProcessSchema.plugin(meta)
ProcessSchema.plugin(owner)

const Process = mongoose.model('Process', ProcessSchema)

module.exports.Process = Process
