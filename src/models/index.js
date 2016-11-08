'use strict'

const Template = require('./template').Template
const Device = require('./device').Device
const ActionSchema = require('./action').ActionSchema
const Process = require('./process').Process
const Sensor = require('./sensor').Sensor
const Data = require('./data').Data

const models = {
  Template,
  Device,
  ActionSchema,
  Process,
  Sensor,
  Data,
}

module.exports = models
