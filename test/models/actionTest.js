'use strict'

process.env.NODE_ENV = 'test'

const chai = require('chai')
const mongoose = require('mongoose')
const ActionSchema = require('../../src/models').ActionSchema

const Action = mongoose.model('Action', ActionSchema)

const should = chai.should() //eslint-disable-line

describe('Action Model', () => {
  it('should be invalid if any required field is empty', (done) => {
    const a = new Action()
    a.validate((err) => {
      err.errors.name.message.should.be.eql('[name] field required')
      err.errors.port.message.should.be.eql('[port] field required')
      err.errors['action.type'].message.should.be.eql('[action.type] field required')
      err.errors.duration.message.should.be.eql('[duration] field required')
      done()
    })
  })
  it('should require [action.value] if [action.type] is "Duty"', (done) => {
    const a = new Action({ duration: 10, port: 0, action: { type: 'Duty' } })
    a.validate((err) => {
      err.errors['action.type'].message.should.be.eql('[action.value] field required')
      done()
    })
  })
  // it('should change the [meta.updatedAt] field to the current time when updated', sinon.test((done) => {
  //   const a = new Action()
  //   const callback = sinon.stub().returns(42)
  //   const proxy = a.update({}, callback)
  //
  //   sinon.assert.equals(proxy(), 42)
  //   done()
  // }))
})
