'use strict'

process.env.NODE_ENV = 'test'

// const mongoose = require('mongoose')
const Device = require('../../src/models').Device
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../src/index')

const should = chai.should() //eslint-disable-line

chai.use(chaiHttp)

// Parent Block
describe('/devices', () => {
  before((done) => { // Empty database before each test
    Device.remove({}, () => {
      done()
    })
  })
  before((done) => {
    const deviceDefault = {
      name: 'foo',
      type: 'bar',
      ownedBy: 1,
      connectionStatus: {
        online: true,
        lastCommunication: Date.now,
      },
      firmware: '0.0.0',
      sensors: {
        wired: [1, 2],
        wireless: [3, 4],
        network: [5, 6],
      },
      processess: {
        currentlyRunning: 1,
        onDevice: [2, 3],
        associated: [4, 5],
      },
      location: {
        description: 'foo',
        lat: 0,
        long: 0,
      },
    }
    chai.request(server)
        .post('/devices')
        .send(deviceDefault)
        .end(() => {
          done()
        })
  })

  // /GET - All devices by all users, min-data
  describe('/GET', () => {
    it('should GET all the devices, min-data', (done) => {
      chai.request(server)
        .get('/devices')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(1)
          res.body[0].should.have.property('name')
          res.body[0].should.have.property('type')
          res.body[0].should.have.property('firmware')
          res.body[0].should.have.property('numSensors')
          done()
        })
    })
  })

  // /GET/:uID - All devices ownedBy uID
  describe('/GET/:uID', () => {
    it('should GET all the devices ownedBy uID', (done) => {
      chai.request(server)
        .get('/devices/1')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(1)
          res.body[0].should.have.property('name')
          res.body[0].should.have.property('meta')
          res.body[0].should.have.property('type')
          res.body[0].should.have.property('connectionStatus')
          res.body[0].should.have.property('firmware')
          res.body[0].should.have.property('sensors')
          res.body[0].should.have.property('processess')
          res.body[0].should.have.property('location')
          done()
        })
    })
  })

  // /POST - Generic Post route, not for users
  describe('/POST', () => {
    it('should NOT POST a Device w/o an [ownedBy] field', (done) => {
      const d = {
        name: 'foo',
        type: '',
        firmware: '0.0.0',
      }
      chai.request(server)
        .post('/devices')
        .send(d)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('message')
          res.body.message.should.be.eql('Device validation failed')
          res.body.errors.ownedBy.message.should.be.eql('Device owner required')
          done()
        })
    })
    it('should POST a Device', (done) => {
      const d = {
        name: 'foo',
        type: 'bar',
        ownedBy: 1,
        firmware: '0.0.0',
      }
      chai.request(server)
        .post('/devices')
        .send(d)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.have.property('name')
          res.body.should.have.property('type')
          res.body.should.have.property('ownedBy')
          res.body.should.have.property('firmware')
          done()
        })
    })
  })

  // /POST/:uID - Create device ownedBy uID
  describe('/POST/:uID', () => {
    it('should NOT POST a Device w/o a [type] field', (done) => {
      const d = {
        name: 'foo',
        firmware: '0.0.0',
      }
      chai.request(server)
          .post('/devices/1')
          .send(d)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('message')
            res.body.message.should.be.eql('Device validation failed')
            res.body.errors.type.message.should.be.eql('Device type required')
            done()
          })
    })
    it('should POST a Device', (done) => {
      const d = {
        name: 'foo',
        type: 'bar',
        firmware: '0.0.0',
      }
      chai.request(server)
        .post('/devices/1')
        .send(d)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.have.property('name')
          res.body.should.have.property('type')
          res.body.should.have.property('firmware')
          done()
        })
    })
  })


  // /PUT/:dID - Update device with id tID
  describe('/PUT/:dID', () => {
    let dID = 0
    it('should get a Device ID', (done) => {
      chai.request(server)
          .get('/devices')
          .end((err, res) => {
            dID = res.body[0].id
            done()
          })
    })
    it('should update the Device w/ dID', (done) => {
      const d = {
        name: 'fudge',
        type: 'barge',
        firmware: '1.1.1',
      }
      chai.request(server)
        .put(`/devices/${dID}`)
        .send(d)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.name.should.be.eql('fudge')
          res.body.type.should.be.eql('barge')
          res.body.firmware.should.be.eql('1.1.1')
          done()
        })
    })
  })
})
