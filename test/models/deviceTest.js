'use strict'

process.env.NODE_ENV = 'test'

const chai = require('chai')
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
})
