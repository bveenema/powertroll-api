'use strict'

function IdError(code, error) {
  Error.captureStackTrace(this, this.constructor)

  this.name = this.constructor.name
  this.message = error.message

  this.code = code
  this.status = 403
  this.inner = error
}

function getID(req, res, next) {
  if (!req.user.sub) {
    return next(new IdError('user_id_missing', {
      message: 'user id is missing.  Check JWT contains openid',
    }))
  }
  const id = req.user.sub.split('|')

  if (id[1]) req.id = id[1]
  else req.id = id[0]

  return next()
}

module.exports = getID
