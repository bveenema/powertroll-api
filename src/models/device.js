'use strict'

const mongoose = require('mongoose')
const meta = require('./plugins/meta')
const owner = require('./plugins/owner')

const Schema = mongoose.Schema

const DeviceSchema = new Schema({
  name: { type: String },
  type: { type: String, required: [true, 'Device type required'] },
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

DeviceSchema.plugin(meta)
DeviceSchema.plugin(owner)

DeviceSchema.virtual('sensors.local').get(() => this.sensors.wired.concat(this.sensors.wireless))

const Device = mongoose.model('Device', DeviceSchema)

module.exports.Device = Device
