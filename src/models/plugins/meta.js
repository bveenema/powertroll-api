'use strict'

module.exports = exports = function metaPlugin(schema, isChild) {
  schema.add({
    meta: {
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
  })

  schema.method('update', function (updates, callback) { // eslint-disable-line func-names
    Object.assign(
      this,
      updates,
      { meta: { updatedAt: new Date(), createdAt: this.meta.createdAt } }
    )
    if (isChild) this.parent.save(callback)
    else this.save(callback)
  })
}
