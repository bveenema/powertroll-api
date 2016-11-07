# powertroll-api
## Description
The API that interacts with the [web app](https://github.com/bveenema/powertroll-web-app), database and Trolls.

## Configuration
Requires Configuration files that are not tracked in GIT for security
### express.config.js
``` JavaScript
const jwt = require('express-jwt')
const AuthenticationClient = require('auth0').AuthenticationClient

let config = {}

config.port = <XXXX>
config.jwtCheck = jwt({
  secret: new Buffer('<secret>', ['base64'] ) // [optional],
  audience: '<clientID>'
})

config.auth0 = new AuthenticationClient({
 domain: '<domain>',
 clientId: '<clientID>'

module.exports = config
```

### expressTest.config.js
``` Javascript
const jwt = require('express-jwt')
const AuthenticationClient = require('auth0').AuthenticationClient

let config = {}

config.port = <XXXX>
config.jwtCheck = jwt({
  secret: new Buffer('<secret>', ['base64'] ) // [optional],
  audience: '<clientID>'
})

config.auth0 = new AuthenticationClient({
 domain: '<domain>',
 clientId: '<clientID>'

config.JWT = '<JWT>'

module.exports = config
```
### mongo.config.js
``` JavaScript
let config = {}

config.db = <db>
config.host = <host>
config.port = <port>
config.user = <user>
config.psswd = <password>

config.uri = 'mongodb://'+config.user+':'+config.psswd+'@'+config.host+':'+config.port+'/'+config.db

module.exports = config
```
### mongoTest.config.js
``` JavaScript
let config = {}

config.db = <db>
config.host = <host>
config.port = <port>
config.user = <user>
config.psswd = <password>

config.uri = 'mongodb://'+config.user+':'+config.psswd+'@'+config.host+':'+config.port+'/'+config.db

module.exports = config
```



## Routes
- /templates
  - GET / - Returns all templates sorted by name with only id, name, needsSensorType and defaultSettings
  - GET /detailed - Returns all templates, sorted by name with all fields
  - GET /:tID - Returns specified template by tID or Error "Template Not Found" 404 if not exist
  - POST / - Posts a new template to the data base with the fields in req.body, must have name field
  - PUT /:tID - Updates the template with the given tID if exists

- /devices
  - GET /all - Returns all devices in the database regardless of user, min-data [id, name, type, firmware, numSensors]
  - GET / - Returns all devices owned by the user
  - POST /all - Creates a device, not for general use (use POST)
  - POST / - Creates a device owned by the user
  - PUT /:dID - Updates the device given by dID

- /sensors
  - GET - Retrieve all devices owned by the user
  - GET/all - Retrieve all devices in db, min-data
  - POST - Create a device owned by the user
  - POST/all - Create a device, not for general user (see POST)
  - PUT/:sID - Update a device given by sID
  - DELETE/:sID - Delete a device given by sID

## Models
### Template
``` JavaScript
name: { type: String, required: true },
needsSensorType: String,
defaultSettings: {
  loadType: String,
  controlType: String,
  controlMethod: String,
},
meta: {
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
},
```
### Device
``` JavaScript
const DeviceSchema = new Schema({
  name: { type: String },
  meta: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  type: { type: String, required: [true, 'Device type required'] },
  ownedBy: { type: String, required: [true, 'Device owner required'] },
  connectionStatus: {
    online: { type: Boolean },
    lastCommunication: { type: Date },
  },
  firmware: { type: String, required: [true, 'Device firmware version required'] },
  sensors: {
    wired: [Number],
    wireless: [Number],
    network: [Number],
  },
  processess: {
    currentlyRunning: { type: Number },
    onDevice: [Number],
    associated: [Number],
  },
  location: {
    description: { type: String },
    lat: { type: Number, min: [-90, 'Latitude invalid'], max: [90, 'Latitude invalid'] },
    long: { type: Number, min: [-180, 'Longitude invalid'], max: [90, 'Longitude invalid'] },
  },
})

DeviceSchema.virtual('sensors.local').get(() => this.sensors.wired.concat(this.sensors.wireless))

DeviceSchema.methods.update = function (updates, callback) { // eslint-disable-line func-names
  Object.assign(this, updates, { meta: { updatedAt: new Date(), createdAt: this.meta.createdAt } })
  this.save(callback)
}

DeviceSchema.statics.findByOwner = function (id, callback) { // eslint-disable-line func-names
  this.find({ ownedBy: id }, callback)
}

DeviceSchema.statics.findByIdCheckOwner = function (id, owner, callback) { // eslint-disable-line func-names, max-len
  this.findById(id, (err, doc) => {
    if (doc.ownedBy !== owner) {
      return callback(new IdError('nonmatching_user_id', {
        message: 'user id does not match process owner. Invalid Request',
      }))
    }
    return callback(err, doc)
  })
}
```
### Sensor
``` JavaScript
name: { type: String },
type: { type: String, required: [true, 'type required'] },
connectionStatus: {
  wireless: { type: Boolean, required: [true, 'wireless true/false required'] },
  online: { type: Boolean },
  lastCommunication: { type: Date },
},
location: {
  description: { type: String },
  lat: { type: Number, min: [-90, 'Latitude invalid'], max: [90, 'Latitude invalid'] },
  long: { type: Number, min: [-180, 'Longitude invalid'], max: [90, 'Longitude invalid'] },
},
dataMeta: {
  type: { type: String, required: [true, 'data type required'] },
  unit: { type: String, required: [true, 'data unit required'] },
  color: [{
    type: Number,
    min: [0, 'color channel too low'],
    max: [255, 'color channel too high'],
    validate: [threeChannelValidate, 'must have 3 channels'],
  }],
  latestData: { type: Number },
},
dataSets: [Schema.Types.ObjectId]
```
