'use strict'

process.env.NODE_ENV = 'test'

const Sensor = require('../../src/models').Sensor
const dataManager = require('../../src/app/dataManager')
const mongoose = require('mongoose')
const moment = require('moment')
const sin = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiHttp = require('chai-http')
const server = require('../../src/index')
const JWT = require('../../config/expressTest.config').JWT

const should = chai.should() //eslint-disable-line

chai.use(sinonChai)
chai.use(chaiHttp)

describe('/sensors', () => {
  let sinon
  beforeEach((done) => { // Empty database
    sinon = sin.sandbox.create()
    Sensor.remove({}, () => {
      done()
    })
  })

  afterEach(() => {
    sinon.restore()
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
    it('should Create a sensor owned by the user', (done) => {
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
          segmentId: new mongoose.Types.ObjectId(),
          pointer: 42,
          seriesId: new mongoose.Types.ObjectId(),
        }
      )
      chai.request(server)
          .post('/sensors')
          .set('Authorization', `Bearer ${JWT}`)
          .send(sWrite)
          .end((err, res) => {
            res.should.have.status(201)
            res.body.should.not.have.property('lastDate')
            res.body.should.not.have.property('lastValue')
            res.body.should.not.have.property('segmentId')
            res.body.should.not.have.property('pointer')
            res.body.should.not.have.property('seriesId')
            done()
          })
    })
    it('should call newSensor from DataManager')
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

  describe('/POST/data', () => {
    const createSensor = (sensor, callback) => {
      chai.request(server)
          .post('/sensors')
          .set('Authorization', `Bearer ${JWT}`)
          .send(sensor)
          .end((err, res) => {
            const sID = res.id
            callback(sID)
          })
    }
    it('should pass data packet and user id to dataManager', (done) => {
      const recieveData = sinon.stub(dataManager, 'recieveData').yields(true)
      const dataPacket = {
        sID: '12345',
        value: -0.8333333,
        time: 7,
      }
      const expectedCall = Object.assign({}, dataPacket, { ownedBy: '12345' })
      chai.request(server)
          .post('/sensors/data')
          .set('Authorization', `Bearer ${JWT}`)
          .send(dataPacket)
          .end(() => {
            recieveData.should.have.callCount(1)
            recieveData.should.have.been.calledWith(expectedCall)
            done()
          })
    })
    it('should respond with 202', (done) => {
      sinon.stub(dataManager, 'processData')
      const dataPacket = {
        sID: '12345',
        value: -0.8333333,
        time: new Date(),
      }
      chai.request(server)
          .post('/sensors/data')
          .set('Authorization', `Bearer ${JWT}`)
          .send(dataPacket)
          .end((error, res) => {
            res.should.have.status(202)
            done()
          })
    })
    it('should update the sensor and data documents', (done) => {
      const testSensor = Object.assign({}, defaultSensor, { name: 'test' })
      createSensor(testSensor, (sID) => {
        const dataPacket = {
          sID,
          value: -0.8333333,
          time: new Date(),
        }
        chai.request(server)
            .post('/sensors/data')
            .set('Authorization', `Bearer ${JWT}`)
            .send(dataPacket)
            .end((err, res) => {
              done()
            })
      })
    })
  })

  describe('/GET/data/:sID?start?stop?numPoints', () => {
    it('should parse query strings and call dm.getQuery()', (done) => {
      const getQuery = sinon.stub(dataManager, 'getQuery').yields(null, {})
      const parseInt = sinon.spy(global, 'parseInt')
      const startDate = moment().valueOf()
      const stopDate = moment().add(3, 'days').valueOf()
      const numPoints = 20
      const s = new Sensor(defaultSensor)
      s.save((err, doc) => {
        chai.request(server)
            .get(`/sensors/data/${doc.id}?start=${startDate}&stop=${stopDate}&numPoints=${numPoints}`)
            .set('Authorization', `Bearer ${JWT}`)
            .end((error, res) => {
              res.should.have.status(200)
              getQuery.should.have.callCount(1)
              parseInt.should.have.been.calledWith(`${startDate}`)
              parseInt.should.have.been.calledWith(`${stopDate}`)
              parseInt.should.have.been.calledWith(`${numPoints}`)
              done()
            })
      })
    })
    it('should return Error if improper query stings', (done) => {
      const startDate = 'tomorrow'
      const stopDate = moment().add(3, 'days').valueOf()
      const numPoints = 'twenty'
      const s = new Sensor(defaultSensor)
      s.save((err, doc) => {
        chai.request(server)
            .get(`/sensors/data/${doc.id}?start=${startDate}&stop=${stopDate}&numPoints=${numPoints}`)
            .set('Authorization', `Bearer ${JWT}`)
            .end((error, res) => {
              res.should.have.status(400)
              error.response.body.code.should.be.eql('invalid_query_param')
              done()
            })
      })
    })
    it('should return the sensors data in the range')
  })
})
