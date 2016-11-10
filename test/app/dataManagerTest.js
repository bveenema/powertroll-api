'use strict'

const sin = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const dataManager = require('../../src/app/dataManager')
const mongoose = require('mongoose')

chai.use(sinonChai)

describe('DataManager', () => {
  const dummySensor = {
    sID: '54321',
    ownedBy: '12345',
  }
  const dataPacket = Object.assign({},
    dummySensor,
    { data: -0.83333, time: new Date() }
  )

  let sinon
  beforeEach(() => {
    sinon = sin.sandbox.create()
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('newSensor(sID, ownedBy, callback)', () => {
    it('should callback error if sID or ownedBy missing', () => {
      dataManager.newSensor(null, null, (err) => {
        err.message.should.be.eql('sID or ownedBy missing')
      })
    })
    it('should call createDataSeries', (done) => {
      const createDataSeries = sinon.stub(dataManager, 'createDataSeries')
      dataManager.newSensor(dummySensor.sID, dummySensor.ownedBy, done)

      createDataSeries.should.have.callCount(1)
      createDataSeries.should.have.been.calledWith(dummySensor.sID, dummySensor.ownedBy)
    })
  })

  describe('recieveData(data)', () => {
    it('should acknowledge data recieved', () => {
      const didRecieve = dataManager.recieveData(dataPacket)
      didRecieve.should.be.eql(true)
    })
    it('should return false if data Packet is malformed', () => {
      const isFalse = dataManager.recieveData({})
      isFalse.should.be.eql(false)
    })
    it('should call processData', () => {
      const processData = sinon.spy(dataManager, 'processData')
      dataManager.recieveData(dataPacket)

      processData.should.have.callCount(1)
      processData.should.have.been.calledWith(dataPacket)
    })
  })

  describe('createDataSeries(sID, ownedBy)', () => {
    it('should just run', (done) => {
      const expectedData = { id: '12345' }
      const save = sinon.stub(mongoose.Model.prototype, 'save').yields(null, expectedData)
      const update = sinon.stub(mongoose.Model, 'update')

      dataManager.createDataSeries(dummySensor.sID, dummySensor.ownedBy)
      done()

      save.should.have.callCount(1)
      update.should.have.callCount(1)
    })
  })

  describe('processData(data)', () => {
    it('should store data in database')
  })

  describe('retrieveData(sensorID, range, [numPoints])', () => {
    it('should retrieve data')
  })
})
