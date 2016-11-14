'use strict'

function QueryError(code, error) {
  Error.captureStackTrace(this, this.constructor)

  this.name = this.constructor.name
  this.message = error.message

  this.code = code
  this.status = 400
  this.inner = error
}

module.exports = QueryError
