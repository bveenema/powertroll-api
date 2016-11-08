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
    it('should Retrieve all devices in db, min-data', (done) => {
      const s = new Sensor(defaultSensor)
      s.save(() => {
        chai.request(server)
            .get('/sensors/all')
            .set('Authorization', `Bearer ${JWT}`)
            .end((err, res) => {
              const r = res.body[0]
              res.should.have.status(200)
              res.body.should.be.a('array')
              r.type.should.be.eql('foo')
              r.should.have.property('connectionStatus')
              r.should.have.property('dataMeta')
              r.should.not.have.property('lastValue')
              done()
            })
      })
    })
    it('should get the number of dataPoints')
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
    it('should strip out any writes to data tracking fields', (done) => {
      const sWrite = Object.assign(
        {},
        defaultSensor,
        {
          lastDate: new Date(),
          lastValue: -0.8333333,
          segmentId: 12345,
          pointer: 42,
        }
      )
      chai.request(server)
          .post('/sensors')
          .set('Authorization', `Bearer ${JWT}`)
          .send(sWrite)
          .end((err, res) => {
            console.log('err: ', err)
            res.should.have.status(201)
            res.body.should.not.have.property('lastDate')
            res.body.should.not.have.property('lastValue')
            res.body.should.not.have.property('segmentId')
            res.body.should.not.have.property('pointer')
            done()
          })
    })
  })
  describe('/POST/all', () => {
    it('should Create a device', (done) => {
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
  describe('/PUT/:sID', () => {
    it('should Update a device given by sID', (done) => {
      const s = new Sensor(defaultSensor)
      const update = { type: 'fudge' }
      s.save((err, doc) => {
        chai.request(server)
            .put(`/sensors/${doc.id}`)
            .set('Authorization', `Bearer ${JWT}`)
            .send(update)
            .end((error, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.type.should.be.eql('fudge')
              res.body.meta.updatedAt.should.be.above(res.body.meta.createdAt)
              done()
            })
      })
    })
  })
  describe('/DELETE/:sID', () => {
    it('should Delete a device given by sID', (done) => {
      const s = new Sensor(defaultSensor)
      s.save((err, doc) => {
        chai.request(server)
            .delete(`/sensors/${doc.id}`)
            .set('Authorization', `Bearer ${JWT}`)
            .end((error, res) => {
              res.should.have.status(200)
              done()
            })
      })
    })
  })
})
