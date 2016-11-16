'use strict'

const Sensor = require('../models').Sensor
const Data = require('../models').Data
const QueryError = require('../errors/QueryError')
const fill = require('lodash.fill')

const dataManager = {}

dataManager.segLen = 160

dataManager.newSensor = function newSensor(sID, oID, callback) {
  if (sID == null || oID == null) {
    return callback(new Error('sID or ownedBy missing'))
  }
  this.createDataSegment(sID, oID)
  return callback()
}

dataManager.recieveData = function recieveData(data) {
  const requiredKeys = ['sID', 'value', 'time', 'ownedBy']
  if (requiredKeys.every(k => k in data)) {
    this.processData(data)
    return true
  }
  return false
}

dataManager.query = function query(sID, oID, startDate, stopDate, callback) { // eslint-disable-line consistent-return, max-len
  if (isNaN(startDate) || isNaN(stopDate)) {
    return callback(new QueryError('invalid_query_param', {
      message: 'One or more query param is NaN, check parameters',
    }))
  }
  this.processQuery(sID, oID, startDate, stopDate, (err, data) => callback(err, data))
}

dataManager.createDataSegment = function createDataSegment(sID, ownedBy, data = {}) {
  const startData = {
    series: sID,
    ownedBy,
    time: fill(Array(this.segLen), 0),
    value: fill(Array(this.segLen), 0),
  }
  startData.time[this.segLen - 1] = data.time || 0
  startData.value[this.segLen - 1] = data.value || 0

  const d = new Data(startData)
  d.save((err, doc) => {
    if (err) {
      console.log('Error: ', err)
    }
    const ptr = (data.time) ? this.segLen - 1 : this.segLen
    Sensor.update({ _id: sID }, { segmentId: doc.id, pointer: ptr }).exec()
  })
}

dataManager.processData = function processData(data) {
  Sensor.findOneAndUpdate(
    { _id: data.sID, ownedBy: data.ownedBy },
    { $set: { lastValue: data.value, lastDate: data.time }, $inc: { pointer: -1 } },
    { new: true },
    (err, sensor) => {
      if (sensor.pointer < 0) {
        this.createDataSegment(sensor.id, sensor.ownedBy, data)
      } else {
        const fields = {}
        fields[`time.${sensor.pointer}`] = data.time
        fields[`value.${sensor.pointer}`] = data.value
        Data.update({ _id: sensor.segmentId }, { $set: fields }).exec()
      }
    }
  )
}

dataManager.processQuery =
  function processQuery(sID, oID, startDate, stopDate, callback) {
    Data.find({
      series: sID,
      ownedBy: oID,
      [`time.${this.segLen - 1}`]: { $lte: stopDate },
      'time.0': { $gte: startDate },
    })
      .sort({ [`time.${this.segLen - 1}`]: -1 })
      .select({ time: 1, value: 1 })
      .exec((err, dataSegments) => {
        const data = {
          time: [],
          value: [],
        }
        dataSegments.forEach((dataSegment) => {
          Array.prototype.push.apply(data.time, dataSegment.time)
          Array.prototype.push.apply(data.value, dataSegment.value)
        })
        return callback(err, data)
      })
  }

module.exports = dataManager
