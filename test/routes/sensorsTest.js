'use strict'

process.env.NODE_ENV = 'test'

const Sensor = require('../../src/models').Sensor
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../src/index')
const JWT = require('../../config/expressTest.config').JWT

const should = chai.should() //eslint-disable-line

chai.use(chaiHttp)

describe('/sensors', () => {
  beforeEach((done) => { // Empty database
    Sensor.remove({}, () => {
      done()
    })
  })
  const defaultSensor = {
    type: 'foo',
    ownedBy: '12345',
    connectionStatus: {
      wireless: 'foo',
    },
    dataMeta: {
      type: 'foo',
      unit: 'foo',
    },
  }
  describe('/GET/', () => {
    it('should Retrieve all devices owned by the user', (done) => {
      const s = new Sensor(defaultSensor)
      s.save(() => {
        chai.request(server)
            .get('/sensors')
            .set('Authorization', `Bearer ${JWT}`)
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('array')
              res.body[0].type.should.be.eql('foo')
              done()
            })
      })
    })
  })
  describe('/GET/all', () => {
    it('should Retrieve all devices in db, min-data')
  })
  describe('/POST/', () => {
    it('should Create a device owned by the user', (done) => {
      chai.request(server)
          .post('/sensors')
          .set('Authorization', `Bearer ${JWT}`)
          .send(defaultSensor)
          .end((err, res) => {
            res.should.have.status(201)
            res.body.should.be.a('object')
            res.body.type.should.be.eql('foo')
            done()
          })
    })
  })
  describe('/POST/all', () => {
    it('should Create a device')
  })
  describe('/PUT/:sID', () => {
    it('should Update a device given by sID')
  })
  describe('/DELETE/:sID', () => {
    it('should Delete a device given by sID')
  })
})
