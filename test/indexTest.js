'use strict'

process.env.NODE_ENV = 'test'

const auth0 = require('../config/express.config').auth0
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../src/index')

const should = chai.should() //eslint-disable-line

chai.use(chaiHttp)

let JWT = ''
auth0.database.signIn(server.user)
              .then((res) => {
                JWT = res.id_token
              })

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

module.exports = JWT
