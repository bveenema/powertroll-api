'use strict'

const express = require('express')
const expressConfig = require('../config/express.config.js')
const jsonParser = require('body-parser').json
const logger = require('morgan')
const routes = require('./routes/index.js')

const app = express()

app.use(logger('dev'))
app.use(jsonParser())

app.use('/', routes)

const mongoose = require('mongoose')

let mongoConfig = ''

if (process.env.NODE_ENV === 'test') {
  mongoConfig = require('../config/mongoTest.config.js').uri //eslint-disable-line
} else {
  mongoConfig = require('../config/mongo.config.js').uri //eslint-disable-line
}

mongoose.connect(mongoConfig)

const dataBase = mongoose.connection

dataBase.on('error', (err) => {
  console.error('connection error:', err)
})

dataBase.once('open', () => {
  console.log('db connection successful')
  app.dataBaseIsConnected = true
})


// Error Handler
app.use((err, req, res, next) => { //eslint-disable-line
  res.status(err.status || 500)
  res.json({
    error: {
      message: err.message,
    },
  })
})

app.listen(expressConfig.port, () => {
  console.log(`Example app listening on port  ${expressConfig.port}!`)
})

module.exports = app // for testing
