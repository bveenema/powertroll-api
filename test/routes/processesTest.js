'use strict'

process.env.NODE_ENV = 'test'

// const mongoose = require('mongoose')
const Process = require('../../src/models').Process
const chai = require('chai')
const chaiHttp = require('chai-http')
const moment = require('moment')
const server = require('../../src/index')
const JWT = require('../../config/expressTest.config').JWT

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

  // GET /all -  Returns all Processes in the database, min-data
  //          [id, name, {control}, numActions, updatedAt]
  describe('/GET /all', () => {
    it('should GET all Processes in the database', (done) => {
      const process = new Process(defaultProcess)
      process.save(() => {
        chai.request(server)
            .get('/processes/all')
            .set('Authorization', `Bearer ${JWT}`)
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
  describe('/GET/:pID', () => {
    it('should GET the Process specidified by pID', (done) => {
      const process = new Process(defaultProcess)
      process.save((err, proc) => {
        chai.request(server)
            .get(`/processes/${proc.id}`)
            .set('Authorization', `Bearer ${JWT}`)
            .end((error, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.sensors[0].should.be.eql(1)
              done()
            })
      })
    })
  })

  // GET /:uID - Returns the Processes owned by uID with all fields
  describe('/GET', () => {
    it('should GET all Processes specified by uID', (done) => {
      const process1 = new Process(defaultProcess)
      const process2 = new Process(Object.assign({}, defaultProcess, { name: 'floor' }))
      process1.save(() => {
        process2.save(() => {
          chai.request(server)
              .get('/processes')
              .set('Authorization', `Bearer ${JWT}`)
              .end((error, res) => {
                res.should.have.status(200)
                res.body.should.be.a('array')
                res.body[0].name.should.be.eql('foo')
                res.body[1].name.should.be.eql('floor')
                done()
              })
        })
      })
    })
  })

  // POST /all - Creates a Process, not for general use (use POST /:uID)
  describe('/POST/all', () => {
    it('should POST a Process', (done) => {
      const currentTime = new Date()
      chai.request(server)
          .post('/processes/all')
          .set('Authorization', `Bearer ${JWT}`)
          .send(defaultProcess)
          .end((err, res) => {
            const createdAt = new Date(res.body.meta.createdAt)
            const updatedAt = new Date(res.body.meta.updatedAt)

            res.should.have.status(201)
            createdAt.should.be.at.least(currentTime)
            updatedAt.should.be.at.least(currentTime)
            done()
          })
    })
  })

  // POST /:uID - Creates a Process ownedBy uID
  describe('/POST', () => {
    it('should POST a process ownedBy uID', (done) => {
      const currentTime = new Date()
      chai.request(server)
          .post('/processes')
          .set('Authorization', `Bearer ${JWT}`)
          .send(defaultProcess)
          .end((err, res) => {
            const createdAt = new Date(res.body.meta.createdAt)

            res.should.have.status(201)
            createdAt.should.be.at.least(currentTime)
            res.body.ownedBy.should.be.eql('12345')
            done()
          })
    })
  })

  // PUT /:pID - Updates a Process specified by pID
  describe('/PUT/:pID', () => {
    it('should update the Process specified by pID', (done) => {
      const process = new Process(defaultProcess)
      const update = { name: 'fudge' }
      process.save((err, proc) => {
        chai.request(server)
            .put(`/processes/${proc.id}`)
            .set('Authorization', `Bearer ${JWT}`)
            .send(update)
            .end((error, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.name.should.be.eql('fudge')
              done()
            })
      })
    })
    it('should update [meta.updatedAt] field', (done) => {
      const futureTime = moment().add(50, 'ms').valueOf()
      const process = new Process(defaultProcess)
      const update = { name: 'frank' }
      process.save((err, proc) => {
        const savedTime = moment(proc.meta.updatedAt).valueOf()
        setTimeout(() => {
          chai.request(server)
              .put(`/processes/${proc.id}`)
              .set('Authorization', `Bearer ${JWT}`)
              .send(update)
              .end((error, res) => {
                const updatedAt = moment(res.body.meta.updatedAt).valueOf()
                const createdAt = moment(res.body.meta.createdAt).valueOf()

                res.should.have.status(200)
                res.body.name.should.be.eql(update.name)
                updatedAt.should.be.at.least(futureTime)
                createdAt.should.be.eql(savedTime)
                done()
              })
        }, 50)
      })
    })
  })

  // GET /:pID/actions
  const defaultAction = {
    name: 'foo',
    port: 1,
    action: {
      type: 'bar',
      value: 42,
    },
    duration: 13,
  }
  describe('/GET/:pID/actions', () => {
    it('should GET all the actions in the process (pID)', (done) => {
      const process = new Process(Object.assign(defaultProcess, { actions: defaultAction }))
      process.save((err, proc) => {
        chai.request(server)
            .get(`/processes/${proc.id}/actions/${proc.actions[0].id}`)
            .set('Authorization', `Bearer ${JWT}`)
            .end((error, res) => {
              res.should.have.status(200)
              res.body.should.be.a('array')
              res.body[0].name.should.be.eql(defaultAction.name)
              done()
            })
      })
    })
  })

  // POST /:pID/actions
  describe('/POST/:pID/actions', () => {
    it('should create a new action in the process (pID)', (done) => {
      done()
    })
  })

  // PUT /:pID/actions/:aID
  describe('/PUT/:pID/actions/:aID', () => {
    it('should update an action (aID)', (done) => {
      done()
    })
  })

  // DELETE /:pID/actions/:aID
  describe('/DELETE/:pID/actions/:aID', () => {
    it('should delete an action (aID)', (done) => {
      done()
    })
  })
})
