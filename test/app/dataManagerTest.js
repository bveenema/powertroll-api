'use strict'

const sinon = require('sinon')
const dataManager = require('../../src/app/dataManager')

describe('DataManager', () => {
  const dataPacket = {
    sID: '54321',
    data: -0.83333,
    time: new Date(),
    ownedBy: '12345',
  }

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
