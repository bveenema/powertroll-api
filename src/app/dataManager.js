'use strict'

const Sensor = require('../models').Sensor
const Data = require('../models').Data
const QueryError = require('../errors/QueryError')
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

dataManager.getQuery = function getQuery(seriesId, startDate, stopDate, callback) { // eslint-disable-line consistent-return, max-len
  if (isNaN(startDate) || isNaN(stopDate)) {
    return callback(new QueryError('invalid_query_param', {
      message: 'One or more query param is NaN, check parameters',
    }))
  }
  this.processQuery(seriesId, startDate, stopDate, (err, data) => callback(err, data))
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
    Sensor.update({ _id: sID }, { seriesId: doc.series, segmentId: doc.id, pointer: ptr }).exec()
  })
}

dataManager.addDataSegment = function addDataSegment(sensor, data) {
  Data.findByIdAndUpdate(
    sensor.segmentId,
    { $set: { nextStart: data.time } },
    { new: true },
    (e, prevData) => {
      this.createDataSegment(sensor.id, sensor.ownedBy, prevData, data)
    }
  )
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

dataManager.processQuery =
  function processQuery(seriesId, startDate, stopDate, callback) {
    Data.find(
      { series: seriesId, prevEnd: { $lte: startDate }, nextStart: { $gte: stopDate } },
      { sort: { prevEnd: 1 } }
    )
      .select({ time: 1, value: 1 })
      .exec((err, dataSegments) => {
        /*
          [
            {
              time: [date1a, date1b, ...]
              value: [num1a, num1b, ...]
            },
            {
              time: [date2a, date2b, ...]
              value: [num2a, num2b, ...]
            },
            {
              time: [date3a, date3b, ...]
              value: [num3a, num3b, ...]
            },
            ...
          ]

          ==> {
                time: [date1a, date1b, ... , date2a, date2b, ... date3a, date3b ...]
                value: [num1a, num1b, ... , num2a, num2b ... , num3a, num3b ...]
              }
        */
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
