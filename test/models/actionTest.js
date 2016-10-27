'use strict'

process.env.NODE_ENV = 'test'

const chai = require('chai')
const Action = require('../../src/models').Action

const should = chai.should() //eslint-disable-line

describe('Action Model', () => {
  it('should be invalid if any required field is empty', (done) => {
    const a = new Action()
    a.validate((err) => {
      err.errors.name.message.should.be.eql('[name] field required')
      err.errors.port.message.should.be.eql('[port] field required')
      err.errors.action.type.should.be.eql('[action.type] field required')
      err.errors.duration.message.should.be.eql('[duration] field required')
      done()
    })
  })
  it('should require [action.value] if [action.type] is "Duty"', (done) => {
    const a = new Action({ action: { type: 'Duty' } })
    a.validate((err) => {
      err.errors.action.value.should.be.eql('[action.value] field required')
      done()
    })
  })
})
