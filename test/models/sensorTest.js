'use strict'

process.env.NODE_ENV = 'test'

const chai = require('chai')
const Sensor = require('../../src/models').Sensor

const should = chai.should() //eslint-disable-line

describe('Device Model', () => {
  const defaultSensor = {
    type: 'foo',
    ownedBy: '12345',
    connectionStatus: {
      wireless: 'foo',
    },
    dataMeta: {
      type: 'foo',
      unit: 'foo',
    },
  }
  it('should be invalid if [type, wireless, data-type, data-unit] is empty', (done) => {
    const s = new Sensor()
    s.validate((err) => {
      err.errors.type.message.should.be.eql('type required')
      err.errors['connectionStatus.wireless'].message.should.be.eql('wireless true/false required')
      err.errors['dataMeta.type'].message.should.be.eql('data type required')
      err.errors['dataMeta.unit'].message.should.be.eql('data unit required')
      done()
    })
  })
  it('should be invalid if color channels are set out of bounds (0,255)', (done) => {
    const s = new Sensor(Object.assign(defaultSensor, { dataMeta: { type: 'foo', unit: 'foo', color: [0, 0, 300] } }))
    s.validate((err) => {
      err.errors['dataMeta.color.2'].message.should.be.eql('color channel too high')
      done()
    })
  })
  it('should be invalid if less than 3 channels on color', (done) => {
    const s = new Sensor(Object.assign(defaultSensor, { dataMeta: { type: 'foo', unit: 'foo', color: [0, 0] } }))
    s.validate((err) => {
      err.errors['dataMeta.color.0'].message.should.be.eql('must have 3 channels')
      done()
    })
  })
})
