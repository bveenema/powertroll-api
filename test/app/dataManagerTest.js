'use strict'

const sinon = require('sinon')
const dataManager = require('../../src/app/dataManager')

describe('DataManager', () => {
  const dummySensor = {
    sID: '54321',
    ownedBy: '12345',
  }
  const dataPacket = Object.assign({},
    dummySensor,
    { data: -0.83333, time: new Date() }
  )

  describe('newSensor(sID, ownedBy, callback)', () => {
    it('should callback error if sID or ownedBy missing', () => {
      dataManager.newSensor(null, null, (err) => {
        err.message.should.be.eql('sID or ownedBy missing')
      })
    })
    it('should call createDataSeries', sinon.test(function () { // eslint-disable-line func-names
      this.spy(dataManager, 'createDataSeries')
      dataManager.newSensor(dummySensor.sID, dummySensor.ownedBy, () => {})

      sinon.assert.callCount(dataManager.createDataSeries, 1)
      sinon.assert.calledWith(dataManager.createDataSeries, dummySensor.sID, dummySensor.ownedBy)
    }))
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
    it('should call processData', sinon.test(function () { // eslint-disable-line func-names
      this.spy(dataManager, 'processData')
      dataManager.recieveData(dataPacket)

      sinon.assert.callCount(dataManager.processData, 1)
      sinon.assert.calledWith(dataManager.processData, dataPacket)
    }))
  })

  describe('processData(data)', () => {
    it('should store data in database')
  })

  describe('retrieveData(sensorID, range, [numPoints])', () => {
    it('should retrieve data')
  })
})
