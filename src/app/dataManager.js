'use strict'

// const Sensor = require('../models').Sensor
// const Data = require('../models').Data

const dataManager = {}

dataManager.recieveData = (data) => {
  const requiredKeys = ['sID', 'data', 'time', 'ownedBy']
  if (requiredKeys.every(k => k in data)) {
    dataManager.processData(data)
    return true
  }
  return false
}

dataManager.processData = (data) => {
  // do something
}

module.exports = dataManager
