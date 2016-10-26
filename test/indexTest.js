'use strict'

process.env.NODE_ENV = 'test'

describe('Wait for DB Connection', () => {
  before((done) => {
    console.log('indexTest')
    setTimeout(() => {
      done()
    }, 3000)
  })
})
