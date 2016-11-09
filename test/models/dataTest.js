'use strict'

process.env.NODE_ENV = 'test'

const chai = require('chai')
const fill = require('lodash.fill')
const random = require('lodash.random')
const moment = require('moment')
const mongoose = require('mongoose')
const Data = require('../../src/models').Data

const should = chai.should() //eslint-disable-line

describe('Data Model', () => {
  beforeEach((done) => { // Empty database
    Data.remove({}, () => {
      done()
    })
  })
  const mockData = {
    time: fill(Array(200), 0),
    value: fill(Array(200), 0),
  }
  mockData.value.forEach((element, index, array) => {
    array[index] = random(100, true)
  })
  mockData.time.forEach((element, index, array) => {
    array[index] = moment().add(1 * index, 's').valueOf()
  })
  const defaultData = {
    series: new mongoose.Types.ObjectId(),
    ownedBy: '12345',
    prevEnd: new Date(),
    nextStart: new Date(),
  }

  it('should fill [time, value] fields with 0\'s when initializing', () => {
    const d = new Data(defaultData)
    d.save((err, doc) => {
      doc.should.have.property('time')
      doc.should.have.property('value')
      doc.time.length.should.be.eql(160)
      doc.value.length.should.be.eql(160)
    })
  })
})
