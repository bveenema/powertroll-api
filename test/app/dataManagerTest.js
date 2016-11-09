'use strict'

const sinon = require('sinon')
const dataManager = require('../../src/app/dataManager')

describe('DataManager', () => {
  describe('recieveData(data)', () => {
    it('should acknowledge data recieved', () => {
      const didRecieve = dataManager.recieveData({})
      didRecieve.should.be.eql(true)
    })
    it('should call processData', sinon.test(function () { // eslint-disable-line func-names
      this.spy(dataManager, 'processData')
      dataManager.recieveData({ foo: 'bar' })

      sinon.assert.callCount(dataManager.processData, 1)
      sinon.assert.calledWith(dataManager.processData, { foo: 'bar' })
    }))
  })
  describe('processData(data)', () => {
    it('should store data in database')
  })

  describe('retrieveData(sensorID, range, [numPoints])', () => {
    it('should retrieve data')
  })
})
