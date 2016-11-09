'use strict'

process.env.NODE_ENV = 'test'

const chai = require('chai')
const mongoose = require('mongoose')
const meta = require('../../src/models/plugins/meta')

const Schema = mongoose.Schema

const should = chai.should() //eslint-disable-line

describe('meta Plugin', () => {
  let Meta
  let m
  before(() => {
    const MetaSchema = new Schema({ name: String })
    MetaSchema.plugin(meta)
    Meta = mongoose.model('Meta', MetaSchema)
    m = new Meta({ name: 'foo' })
  })
  beforeEach((done) => { // Empty database
    Meta.remove({}, () => {
      done()
    })
  })

  it('should add [meta] field to schema', () => {
    m.save((err, doc) => {
      doc.meta.should.have.property('updatedAt')
      doc.meta.should.have.property('createdAt')
    })
  })
  it('should add [update] method to model', (done) => {
    m.save((err, doc) => {
      setTimeout(() => {
        doc.update({ name: 'bar' }, (error, document) => {
          document.name.should.be.eql('bar')
          document.meta.updatedAt.should.be.above(document.meta.createdAt)
          done()
        })
      }, 10)
    })
  })
})
