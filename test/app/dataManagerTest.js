'use strict'

const sin = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const dataManager = require('../../src/app/dataManager')
// const Data = require('../../src/models/data')
const mongoose = require('mongoose')
require('sinon-mongoose')

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
    it('should create a data store and update sensor', (done) => {
      const expectedData = { id: new mongoose.Types.ObjectId() }
      const save = sinon.stub(mongoose.Model.prototype, 'save').yields(null, expectedData)
      const exec = { exec: sinon.stub().callsArg(0) }
      const update = sinon.stub(mongoose.Model, 'update').returns(exec)


      dataManager.createDataSegment(mongoose.Types.ObjectId(), dummySensor.ownedBy)
      setTimeout(() => {
        save.should.have.callCount(1)
        update.should.have.callCount(1)
        update.should.have.been.calledWith({ _id: '12' })
        done()
      }, 10)
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
      const exec = { exec: sinon.stub().callsArg(0) }
      const update = sinon.stub(mongoose.Model, 'update').returns(exec)

      dataManager.processData(mockPacket)
      setTimeout(() => {
        done()
      }, 10)

      findOneAndUpdate.should.have.callCount(1)
      findOneAndUpdate.should.have.been.calledWith(
        { _id: mockPacket.sID, ownedBy: mockPacket.ownedBy }
      )
      update.should.have.callCount(1)
    })
    it('should call addDataSegment if pointer < 0')
  })

  describe('retrieveData(sensorID, range, [numPoints])', () => {
    it('should retrieve data')
  })
})
