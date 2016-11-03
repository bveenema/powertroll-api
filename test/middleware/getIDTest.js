'use strict'

const getID = require('../../src/middleware/getID')

describe('Middleware: getID', () => {
  it('should put the user id on req.id [string|user_id]', () => {
    const req = { user: { sub: 'test|12345' } }
    getID(req, null, () => {
      req.id.should.be.eql('12345')
    })
  })
  it('should put the user id on req.id [user_id]', () => {
    const req = { user: { sub: '12345' } }
    getID(req, null, () => {
      req.id.should.be.eql('12345')
    })
  })
  it('should return and error if req.user does not exist', () => {
    const req = { user: {} }
    getID(req, null, (err) => {
      err.should.have.status(403)
      err.name.should.be.eql('IdError')
      err.code.should.be.eql('user_id_missing')
    })
  })
})
