'use strict'

process.env.NODE_ENV = 'test'

// const mongoose = require('mongoose')
const Process = require('../../src/models').Process
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../src/index')

const should = chai.should() //eslint-disable-line

chai.use(chaiHttp)

// Parent Block
describe('/processes', () => {
  beforeEach((done) => { // Empty database
    Process.remove({}, () => {
      done()
    })
  })
  const defaultProcess = {
    name: 'foo',
    ownedBy: 1,
    device: {
      id: 1,
      port: 1,
    },
    sensors: [1],
    loadType: 'bar',
    control: {
      type: 'foobar',
      method: 'barfoo',
      value: 1,
    },
  }

  // GET / -  Returns all Processes in the database, min-data
  //          [id, name, {control}, numActions, updatedAt]
  describe('/GET /', () => {
    it('should GET all Processes in the database', (done) => {
      const process = new Process(defaultProcess)
      process.save(() => {
        chai.request(server)
            .get('/processes')
            .end((error, res) => {
              res.should.have.status(200)
              res.body.should.be.a('array')
              res.body[0].control.should.be.eql(defaultProcess.control)
              done()
            })
      })
    })
  })

  // GET /:pID - Returns the Process specified by pID with all fields

  // GET /:uID - Returns the Processes owned by uID with all fields

  // POST / - Creates a Process, not for general use (use POST /:uID)

  // POST /:uID - Creates a Process ownedBy uID

  // PUT /:pID - Updates a Process specified by pID
  describe('/PUT/:pID', () => {
    it('should update the Process specified by pID', (done) => {
      const process = new Process(defaultProcess)
      const update = { name: 'fudge' }
      process.save((err, proc) => {
        chai.request(server)
            .put(`/processes/${proc.id}`)
            .send(update)
            .end((error, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.name.should.be.eql('fudge')
              done()
            })
      })
    })
  })
})
