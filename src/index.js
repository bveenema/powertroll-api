'use strict'

const express = require('express')
const jsonParser = require('body-parser').json
const logger = require('morgan')
const routes = require('./routes/index.js')
const mongoose = require('mongoose')

const app = express()

let mongoConfig
let expressConfig

if (process.env.NODE_ENV === 'test') {
  mongoConfig = require('../config/mongoTest.config.js').uri // eslint-disable-line global-require
  expressConfig = require('../config/expressTest.config.js') // eslint-disable-line global-require
  app.user = expressConfig.user
} else {
  mongoConfig = process.env.dbUri
  const jwt = require('express-jwt') // eslint-disable-line global-require
  const AuthenticationClient = require('auth0').AuthenticationClient // eslint-disable-line global-require
  expressConfig = {
    port: 3010,
    jwtCheck: jwt({
      secret: new Buffer(process.env.secret, 'base64'),
      audience: process.env.clientId,
    }),
    auth0: new AuthenticationClient({
      domain: process.env.domain,
      clientId: process.env.clientId,
    }),
  }
  app.use(logger('dev'))
}

app.use(jsonParser())
app.use('/', routes)

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
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err.code === 'permission_denied') {
    res.status(401).send('insufficient permissions')
  }
  res.status(err.status || 500)
  res.json(err)
})

app.listen(expressConfig.port, () => {
  console.log(`PowerTroll API listening on port  ${expressConfig.port}!`)
})

module.exports = app // for testing
