'use strict'

process.env.NODE_ENV = 'test'

const chai = require('chai')
const sinon = require('sinon')
require('sinon-mongoose')
const mongoose = require('mongoose')
const owner = require('../../src/models/plugins/owner')

const Schema = mongoose.Schema

const should = chai.should() //eslint-disable-line

describe('owner Plugin', () => {
  let New
  let n
  before(() => {
    const NewSchema = new Schema({})
    NewSchema.plugin(owner)
    New = mongoose.model('New', NewSchema)
    n = new New()
  })

  it('should add [owner] field to schema', (done) => {
    n.validate((err) => {
      err.errors.ownedBy.message.should.be.eql('owner required')
      done()
    })
  })

  it('should add [findbyOwner] static to schema', sinon.test(function (done) { // eslint-disable-line func-names
    const expectedDevice = { ownedBy: '12345' }
    this.mock(New).expects('find')
          .chain('sort').withArgs({})
          .chain('exec')
          .yields(null, [expectedDevice])
    const n2 = new New(expectedDevice)
    n2.save(() => {
      New.findByOwner('12345', {}, (err, docs) => {
        docs.should.be.a('array')
        docs[0].should.be.eql(expectedDevice)
        done()
      })
    })
  }))

  it('should add [findByIdCheckOwner] static to schema', sinon.test(function (done) { // eslint-disable-line func-names
    const expectedDevice = { ownedBy: '12345', id: '54321' }
    this.stub(New, 'findById').yields(null, expectedDevice)
    const n2 = new New(expectedDevice)
    n2.save(() => {
      New.findByIdCheckOwner(expectedDevice.id, expectedDevice.ownedBy, (error, doc) => {
        doc.should.be.a('object')
        doc.should.be.eql(expectedDevice)
        done()
      })
    })
  }))
})
