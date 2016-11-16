'use strict'

const mongoose = require('mongoose')
const owner = require('./plugins/owner')
const fill = require('lodash.fill')

const Schema = mongoose.Schema

const zeroArray = fill(Array(160), 0)

const DataSchema = new Schema({
  series: Schema.Types.ObjectId,
  ownedBy: String,
  time: [Date],
  value: [Number],
})

DataSchema.plugin(owner)

DataSchema.pre('save', function (next) { // eslint-disable-line func-names
  if (this.time.length === 0) this.time = zeroArray
  if (this.value.length === 0) this.value = zeroArray
  next()
})

const Data = mongoose.model('Data', DataSchema)

module.exports.Data = Data
