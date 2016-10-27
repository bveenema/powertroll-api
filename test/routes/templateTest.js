'use strict'

process.env.NODE_ENV = 'test'

// const mongoose = require('mongoose')
const Template = require('../../src/models').Template
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../src/index')

const should = chai.should() //eslint-disable-line

chai.use(chaiHttp)

// Parent Block
describe('/templates', () => {
  beforeEach((done) => { // Empty database before each test
    Template.remove({}, () => {
      done()
    })
  })

  // Get Route
  describe('/GET templates', () => {
    it('should GET all the Templates', (done) => {
      chai.request(server)
        .get('/templates')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(0)
          done()
        })
    })
  })

  // Post Route
  describe('/POST Template', () => {
    it('should NOT POST a Template w/o a [name] field', (done) => {
      const template = {
        needsSensorType: 'temperature',
        defaultSettings: {
          controlType: 'resistive',
          loadType: 'setpoint',
          controlMethod: 'PID',
        },
      }
      chai.request(server)
          .post('/templates')
          .send(template)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('message')
            res.body.message.should.be.eql('Template validation failed')
            done()
          })
    })
    it('should POST a Template', (done) => {
      const template = {
        name: 'template',
        needsSensorType: 'any',
        defaultSettings: {
          controlType: 'resistive',
          loadType: 'setpoint',
          controlMethod: 'PID',
        },
      }
      chai.request(server)
        .post('/templates')
        .send(template)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.have.property('name')
          res.body.should.have.property('needsSensorType')
          res.body.should.have.property('defaultSettings')
          done()
        })
    })
  })

  // GET /:tID Route
  describe('/GET/:tID Template', () => {
    it('should GET a specific Template given by id', (done) => {
      const template = new Template({ name: 'newish template' })
      template.save((err, temp) => {
        chai.request(server)
            .get(`/templates/${temp.id}`)
            .end((error, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.should.have.property('name')
              res.body.should.have.property('_id').eql(template.id)
              done()
            })
      })
    })
  })

  // /PUT/:dID - Update device with id tID
  describe('/PUT/:tID', () => {
    it('should update the Template w/ tID', (done) => {
      const template = new Template({ name: 'newish template' })
      const update = { name: 'fudge' }
      template.save((err, temp) => {
        chai.request(server)
            .put(`/templates/${temp.id}`)
            .send(update)
            .end((error, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.name.should.be.eql('fudge')
              done()
            })
      })
    })
  })
})
