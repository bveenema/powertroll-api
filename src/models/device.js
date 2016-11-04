'use strict'

const mongoose = require('mongoose')
const IdError = require('../errors/idError')

const Schema = mongoose.Schema

const DeviceSchema = new Schema({
  name: { type: String },
  meta: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  type: { type: String, required: [true, 'Device type required'] },
  ownedBy: { type: String, required: [true, 'Device owner required'] },
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

DeviceSchema.methods.update = function (updates, callback) { // eslint-disable-line func-names
  Object.assign(this, updates, { meta: { updatedAt: new Date(), createdAt: this.meta.createdAt } })
  this.save(callback)
}

DeviceSchema.statics.findByOwner = function (id, callback) { // eslint-disable-line func-names
  this.find({ ownedBy: id }, callback)
}

DeviceSchema.statics.findByIdCheckOwner = function (id, owner, callback) { // eslint-disable-line func-names, max-len
  this.findById(id, (err, doc) => {
    if (doc.ownedBy !== owner) {
      return callback(new IdError('nonmatching_user_id', {
        message: 'user id does not match process owner. Invalid Request',
      }))
    }
    return callback(err, doc)
  })
}

const Device = mongoose.model('Device', DeviceSchema)

module.exports.Device = Device
