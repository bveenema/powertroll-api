'use strict'

process.env.NODE_ENV = 'test'

let mongoose = require('mongoose'),
    Template = require('../src/models').Template

let chai = require('chai'),
    chaiHttp = require('chai-http'),
    server = require('../src/index')
let should = chai.should()

chai.use(chaiHttp)

// Parent Block
describe('Templates', () => {
  beforeEach((done) => { //Empty database before each test
    Template.remove({}, (err) => {
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
    it('should not POST a Template w/o a name field', (done) => {
      let template = {
        needsSensorType: 'temperature',
        defaultSettings: {
          controlType: 'resistive',
          loadType: 'setpoint',
          controlMethod: 'PID'
        }
      }
      chai.request(server)
          .post('/templates')
          .send(template)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('error')
            res.body.error.should.have.property('message')
            res.body.error.message.should.be.eql('Template validation failed')
            done()
          })
    })
    it('should POST a Template', (done) => {
      let template = {
        name: 'template',
        needsSensorType: 'any',
        defaultSettings: {
          controlType: 'resistive',
          loadType: 'setpoint',
          controlMethod: 'PID'
        }
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
      let template = new Template({name:'newish template'})
      template.save((err, template) => {
        chai.request(server)
            .get('/templates/'+template.id)
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.should.have.property('name')
              res.body.should.have.property('_id').eql(template.id)
              done()
            })
      })
    })
  })

})
