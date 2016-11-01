'use strict'

process.env.NODE_ENV = 'test'

const AuthenticationClient = require('auth0').AuthenticationClient

const auth0 = new AuthenticationClient({
  domain: '{{domain}}.auth0.com',
  clientId: '{{client}}',
})

describe('DB Connection', () => {
  before((done) => {
    setTimeout(() => {
      done()
    }, 1000)
  })
  it('Wait for db to connect', () => {
    const x = true
    x.should.be.eql(true)
  })
})
