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
    { value: -0.83333, time: new Date() }
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
    it('should call createDataSegment', (done) => {
      const createDataSegment = sinon.stub(dataManager, 'createDataSegment')
      dataManager.newSensor(dummySensor.sID, dummySensor.ownedBy, done)

      createDataSegment.should.have.callCount(1)
      createDataSegment.should.have.been.calledWith(dummySensor.sID, dummySensor.ownedBy)
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

  describe('createDataSegment(sID, ownedBy)', () => {
    it('should create a data and update sensor', (done) => {
      const expectedData = { id: '12345' }
      const save = sinon.stub(mongoose.Model.prototype, 'save').yields(null, expectedData)
      const update = sinon.stub(mongoose.Model, 'update')

      dataManager.createDataSegment(dummySensor.sID, dummySensor.ownedBy)
      done()

      save.should.have.callCount(1)
      update.should.have.callCount(1)
    })
  })

  describe('processData(data)', () => {
    const mockPacket = {
      sID: '12345',
      ownedBy: '54321',
      value: -0.83333,
      time: 42,
    }
    const expectedSensor = {
      pointer: 101,
      segmentId: '8675309',
    }
    it('should find and update the sensor and data Segment', (done) => {
      const findOneAndUpdate = sinon.stub(mongoose.Model, 'findOneAndUpdate').yields(null, expectedSensor)
      const update = sinon.stub(mongoose.Model, 'update')

      dataManager.processData(mockPacket)
      done()

      findOneAndUpdate.should.have.callCount(1)
      update.should.have.callCount(1)
      findOneAndUpdate.should.have.been.calledWith(
        { _id: mockPacket.sID, ownedBy: mockPacket.ownedBy }
      )
    })
    it('should call addDataSegment if pointer < 0')
  })

  describe('addDataSegment(sensor, data)', () => {
    it('should call createDataSegment', (done) => {
      const mockDataSegment = {
        series: '12345',
        ownedBy: '12345',
        prevEnd: new Date(0),
        nextStart: new Date(),
        time: [new Date(0), new Date(1000), new Date(2000)],
        value: [0, 1, 2],
      }
      const mockSensor = {
        id: '12345',
        ownedBy: '12345',
      }
      const mockData = {
        sID: '54321',
        time: new Date(),
        value: -0.83333,
        ownedBy: '12345',
      }
      const findOneAndUpdate = sinon.stub(mongoose.Model, 'findOneAndUpdate').yields(null, mockDataSegment)
      const createDataSegment = sinon.stub(dataManager, 'createDataSegment')


      dataManager.addDataSegment(mockSensor, mockData)
      done()

      findOneAndUpdate.should.have.callCount(1)
      createDataSegment.should.have.callcount(1)
      createDataSegment.should.have.been.calledWith(
        mockSensor.id,
        mockSensor.ownedBy,
        mockDataSegment,
        mockData
      )
    })
  })

  describe('retrieveData(sensorID, range, [numPoints])', () => {
    it('should retrieve data')
  })
})
