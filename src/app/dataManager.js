'use strict'

const Sensor = require('../models').Sensor
const Data = require('../models').Data
const mongoose = require('mongoose')
const moment = require('moment')
const fill = require('lodash.fill')

const dataManager = {}

dataManager.segLen = 5

dataManager.newSensor = function newSensor(sID, ownedBy, callback) {
  if (sID == null || ownedBy == null) {
    return callback(new Error('sID or ownedBy missing'))
  }
  this.createDataSegment(sID, ownedBy)
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

dataManager.createDataSegment = function createDataSegment(sID, ownedBy, prevData = {}, data = {}) {
  let prevTime
  if (prevData.time) prevTime = prevData.time[0]

  const startData = {
    series: prevData.series || new mongoose.Types.ObjectId(),
    ownedBy,
    prevEnd: prevTime || moment(0).toDate(),
    nextStart: moment().year(30000).toDate(),
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
    (err, doc) => {
      if (doc.pointer < 0) {
        this.addDataSegment(doc, data)
      } else {
        const fields = {}
        fields[`time.${doc.pointer}`] = data.time
        fields[`value.${doc.pointer}`] = data.value
        Data.update({ _id: doc.segmentId }, { $set: fields }).exec()
      }
    }
  )
}

dataManager.addDataSegment = function addDataSegment(sensor, data) {
  // Update nextStart on previous DataSegment and get series and ownedBy
  Data.findByIdAndUpdate(
    sensor.segmentId,
    { $set: { nextStart: data.time } },
    { new: true },
    (e, prevData) => {
      // Create a new data segment and store data and prevEnd
      this.createDataSegment(sensor.id, sensor.ownedBy, prevData, data)
    }
  )
}

module.exports = dataManager
