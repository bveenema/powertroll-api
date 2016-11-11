'use strict'

const Sensor = require('../models').Sensor
const Data = require('../models').Data
const mongoose = require('mongoose')
const moment = require('moment')
const fill = require('lodash.fill')

const dataManager = {}

dataManager.newSensor = (sID, ownedBy, callback) => {
  if (sID == null || ownedBy == null) {
    return callback(new Error('sID or ownedBy missing'))
  }
  dataManager.createDataSeries(sID, ownedBy)
  return callback()
}

dataManager.recieveData = (data) => {
  const requiredKeys = ['sID', 'value', 'time', 'ownedBy']
  if (requiredKeys.every(k => k in data)) {
    dataManager.processData(data)
    return true
  }
  return false
}

dataManager.createDataSeries = (sID, ownedBy) => {
  const startData = {
    series: new mongoose.Types.ObjectId(),
    ownedBy,
    prevEnd: moment(0).toDate(),
    nextStart: moment().year(30000).toDate(),
  }
  const d = new Data(startData)
  d.save((err, doc) => {
    if (err) {
      console.log(`Error Creating Data Document! sID: ${sID} ownedBy: ${ownedBy}`)
    }
    Sensor.update({ _id: sID }, { segmentId: doc.id, pointer: 160 }).exec()
  })
}

dataManager.processData = (data) => {
  Sensor.findOneAndUpdate(
    { _id: data.sID, ownedBy: data.ownedBy },
    { $set: { lastValue: data.value, lastDate: data.time }, $inc: { pointer: -1 } },
    { new: true },
    (err, doc) => {
      if (doc.pointer < 0) {
        dataManager.addDataSegment(doc, data)
      } else {
        const fields = {}
        fields[`time.${doc.pointer}`] = data.time
        fields[`value.${doc.pointer}`] = data.value
        Data.update({ _id: doc.segmentId }, { $set: fields }).exec()
      }
    }
  )
}

dataManager.addDataSegment = (sensor, data) => {
  // Update nextStart on previous DataSegment and get series and ownedBy
  Data.findByIdAndUpdate(
    sensor.segmentId,
    { $set: { nextStart: data.time } },
    { new: true },
    (e, prevData) => {
      // Create a new data segment and store data and prevEnd
      const newData = {
        series: prevData.series,
        ownedBy: prevData.ownedBy,
        prevEnd: prevData.time[0],
        nextStart: moment().year(30000).toDate(),
        time: fill(Array(160), 0),
        value: fill(Array(160), 0),
      }
      newData.time[160 - 1] = data.time
      newData.value[160 - 1] = data.value
      const d = new Data(newData)
      d.save((err, doc) => {
        // Update Sensor with new segmentId and reset pointer
        if (err) {
          console.log(`Error Creating Data Document! sID: ${sensor.id} ownedBy: ${sensor.ownedBy}`)
        }
        Sensor.update({ _id: sensor.id }, { segmentId: doc.id, pointer: 160 }).exec()
      })
    }
  )
}

module.exports = dataManager
