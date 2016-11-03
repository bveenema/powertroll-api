'use strict'

process.env.NODE_ENV = 'test'

const JWT = require('../config/expressTest.config').JWT
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../src/index')

const should = chai.should() //eslint-disable-line

chai.use(chaiHttp)

describe('DB Connection', () => {
  before((done) => {
    setTimeout(() => {
      done()
    }, 1000)
  })
  it('Test authenticated route', (done) => {
    chai.request(server)
        .get('/authCheck')
        .set('Authorization', `Bearer ${JWT}`)
        .end((err, res) => {
          res.should.have.status(200)
          done()
        })
  })
})
