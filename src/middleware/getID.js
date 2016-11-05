'use strict'

const IdError = require('../errors/idError')

function getID(req, res, next) {
  if (!req.user.sub) {
    return next(new IdError('user_id_missing', {
      message: 'user id is missing.  Check JWT contains openid',
    }))
  }
  const id = req.user.sub.split('|')

  if (id[1]) req.id = id[1]
  else req.id = id[0]

  if (!next) return null
  return next()
}

module.exports = getID
