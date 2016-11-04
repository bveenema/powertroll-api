'use strict'

process.env.NODE_ENV = 'test'

const chai = require('chai')
const sinon = require('sinon')
const mongoose = require('mongoose')
const meta = require('../../src/models/plugins/meta')

const Schema = mongoose.Schema

const should = chai.should() //eslint-disable-line

describe('meta Plugin', () => {
  let Meta
  let m
  before(() => {
    const MetaSchema = new Schema({})
    MetaSchema.plugin(meta)
    Meta = mongoose.model('Meta', MetaSchema)
    m = new Meta()
  })

  it('should at [meta] field to schema', (done) => {
    m.save((err, doc) => {
      doc.meta.should.have.property('updatedAt')
      doc.meta.should.have.property('createdAt')
      done()
    })
  })
  it('should at [update] method to model')
})
