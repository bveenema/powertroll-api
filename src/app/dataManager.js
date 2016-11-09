'use strict'

const dataManager = {}

dataManager.recieveData = (data) => {
  dataManager.processData(data)
  return true
}

dataManager.processData = (data) => {
  // do something
}

module.exports = dataManager
