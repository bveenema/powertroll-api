'use strict'

process.env.NODE_ENV = 'test'

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
