'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const DeviceSchema = new Schema({
  name: { type: String },
  meta: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  type: { type: String, required: [true, 'Device type required'] },
  ownedBy: { type: Number, required: [true, 'Device owner required'] },
  connectionStatus: {
    online: { type: Boolean },
    lastCommunication: { type: Date },
  },
  firmware: { type: String, required: [true, 'Device firmware version required'] },
  sensors: {
    wired: [Number],
    wireless: [Number],
    network: [Number],
  },
  processess: {
    currentlyRunning: { type: Number },
    onDevice: [Number],
    associated: [Number],
  },
  location: {
    description: { type: String },
    lat: { type: Number, min: [-90, 'Latitude invalid'], max: [90, 'Latitude invalid'] },
    long: { type: Number, min: [-180, 'Longitude invalid'], max: [90, 'Longitude invalid'] },
  },
})

DeviceSchema.virtual('sensors.local').get(() => this.sensors.wired.concat(this.sensors.wireless))

const Device = mongoose.model('Device', DeviceSchema)

module.exports.Device = Device
