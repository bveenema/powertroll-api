'use strict'

process.env.NODE_ENV = 'test'

const chai = require('chai')
const Process = require('../../src/models').Process

const should = chai.should() //eslint-disable-line

describe('Process Model', () => {
  it('should be invalid if any required field is empty', (done) => {
    const p = new Process()
    p.validate((err) => {
      console.log('err: ', err)
      err.errors.name.message.should.be.eql('[name] field required')
      err.errors['device.id'].message.should.be.eql('[device.id] field required')
      err.errors['device.port'].message.should.be.eql('[device.port] field required')
      err.errors.sensors.message.should.be.eql('[sensors] field required')
      err.errors.loadType.message.should.be.eql('[loadType] field required')
      err.errors['control.type'].message.should.be.eql('[control.type] field required')
      err.errors['control.method'].message.should.be.eql('[control.method] field required')
      err.errors['control.value'].message.should.be.eql('[control.value] field required')
      done()
    })
  })
})
