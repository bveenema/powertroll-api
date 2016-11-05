'use static'

const IdError = require('../../errors/idError')

module.exports = exports = function owner(schema) {
  schema.add({ ownedBy: { type: String, required: [true, 'owner required'] } })

  schema.statics.findByOwner = function (id, sort, callback) { // eslint-disable-line func-names
    this.find({ ownedBy: id })
        .sort(sort)
        .exec((err, docs) => {
          callback(err, docs)
        })
  }

  schema.statics.findByIdCheckOwner = function (id, ownedBy, callback) { // eslint-disable-line func-names, max-len
    this.findById(id, (err, doc) => {
      if (doc.ownedBy !== ownedBy) {
        return callback(new IdError('nonmatching_user_id', {
          message: 'user id does not match process owner. Invalid Request',
        }))
      }
      return callback(err, doc)
    })
  }
}
