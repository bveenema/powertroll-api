'use strict'

const Sensor = require('../models').Sensor
const Data = require('../models').Data
const mongoose = require('mongoose')
const moment = require('moment')

const dataManager = {}

dataManager.newSensor = (sID, ownedBy, callback) => {
  if (sID == null || ownedBy == null) {
    return callback(new Error('sID or ownedBy missing'))
  }
  dataManager.createDataSeries(sID, ownedBy)
  return callback()
}

dataManager.recieveData = (data) => {
  const requiredKeys = ['sID', 'data', 'time', 'ownedBy']
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
    Sensor.update({ _id: sID }, { segmentId: doc.id, pointer: 159 }).exec()
  })
}

dataManager.processData = (data) => {
  // read sensor from db (findbyIdAndUpdate)
  Sensor.findByIdCheckOwner(data.sID, data.ownedBy, (err, doc) => {
    // update data Segment at pointer
    Data.update({ _id: doc.segmentId }, { `time.${doc.pointer}`: data.time, `value.${doc.pointer}`: data.data}).exec()

  })

}

module.exports = dataManager
