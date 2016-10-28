'use strict'

const mongoose = require('mongoose')
const ActionSchema = require('./action').ActionSchema

const Schema = mongoose.Schema

const ProcessSchema = new Schema({
  name: { type: String, required: [true, '[name] field required'] },
  device: {
    id: { type: Number, required: [true, '[device.id] field required'] },
    port: { type: Number, required: [true, '[device.port] field required'] },
  },
  sensors: [{ type: Number, required: [true, '[sensors] field required'] }],
  loadType: { type: String, required: [true, '[loadType] field required'] },
  control: {
    type: { type: String, required: [true, '[control.type] field required'] },
    method: { type: String, required: [true, '[control.method] field required'] },
    value: { type: String, required: [true, '[control.value] field required'] },
  },
  meta: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  action: [ActionSchema],
})

ProcessSchema.method('update', (updates, callback) => {
  Object.assign(this, updates, { meta: { updatedAt: new Date() } })
  this.parent().save(callback)
})

const Process = mongoose.model('Process', ProcessSchema)

module.exports.Process = Process
