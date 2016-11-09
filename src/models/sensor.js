'use strict'

const mongoose = require('mongoose')
const meta = require('./plugins/meta')
const owner = require('./plugins/owner')
const Data = require('./data')

const Schema = mongoose.Schema

function threeChannelValidate() {
  if (this.dataMeta.color.length !== 3) return false
  return true
}

const SensorSchema = new Schema({
  name: { type: String },
  type: { type: String, required: [true, 'type required'] },
  connectionStatus: {
    wireless: { type: Boolean, required: [true, 'wireless true/false required'] },
    online: { type: Boolean },
    lastCommunication: { type: Date },
  },
  location: {
    description: { type: String },
    lat: { type: Number, min: [-90, 'Latitude invalid'], max: [90, 'Latitude invalid'] },
    long: { type: Number, min: [-180, 'Longitude invalid'], max: [90, 'Longitude invalid'] },
  },
  dataMeta: {
    type: { type: String, required: [true, 'data type required'] },
    unit: { type: String, required: [true, 'data unit required'] },
    color: [{
      type: Number,
      min: [0, 'color channel too low'],
      max: [255, 'color channel too high'],
      validate: [threeChannelValidate, 'must have 3 channels'],
    }],
  },
  lastDate: Date,
  lastValue: Number,
  segmentId: Schema.Types.ObjectId,
  pointer: Number,
})

SensorSchema.plugin(meta)
SensorSchema.plugin(owner)

SensorSchema.pre('save', function (next) {
  let d
  if (!(segmentId in this)) {
    d = new Data({
      series: this.id,
      ownedBy: this.ownedBy,
    })
  }
})

const Sensor = mongoose.model('Sensor', SensorSchema)

module.exports.Sensor = Sensor
