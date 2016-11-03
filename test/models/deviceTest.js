'use strict'

process.env.NODE_ENV = 'test'

const chai = require('chai')
const sinon = require('sinon')
const Device = require('../../src/models').Device

const should = chai.should() //eslint-disable-line

describe('Device Model', () => {
  it('should be invalid if [firmware, type, ownedBy] is empty', (done) => {
    const d = new Device()
    d.validate((err) => {
      err.errors.type.message.should.be.eql('Device type required')
      err.errors.ownedBy.message.should.be.eql('Device owner required')
      err.errors.firmware.message.should.be.eql('Device firmware version required')
      done()
    })
  })
  it('should return docs when findByOwner', sinon.test(function (done) { // eslint-disable-line func-names
    const expectedDevice = { firmware: 'foo', type: 'foo', ownedBy: '12345' }
    this.stub(Device, 'find').yields(null, [expectedDevice])
    const d = new Device(expectedDevice)

    d.findByOwner('12345', (err, docs) => {
      docs.should.be.a('array')
      docs[0].should.be.eql(expectedDevice)
      done()
    })
  }))
})
