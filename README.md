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

- /processes
  - GET /all - Returns all Processes in the database regardless of user, min data
  - GET/:pID - Returns the Process specified by pID
  - GET - Returns all Processes specified owned by the user
  - POST/all - Creates a Process, not for general use (use POST)
  - POST - Creates a process ownedBy the user
  - PUT/:pID - Updates the Process specified by pID
  - GET/:pID/actions - Returns all the actions in the process pID
  - POST/:pID/actions - Creates a new action in the process pID
  - PUT/:pID/actions/:aID - Updates an action on pID, given by aID
  - DELETE/:pID/actions/:aID - Deletes and action on pID given by aID

- /sensors
  - GET - Retrieve all devices owned by the user
  - GET/all - Retrieve all devices in db, min-data
  - POST - Create a device owned by the user
  - POST/all - Create a device, not for general user (see POST)
  - PUT/:sID - Update a device given by sID
  - DELETE/:sID - Delete a device given by sID
  - /data
    - POST - Adds data to the db.  Body must have { sensorId, data, time }
    - GET/:sID?start=""?stop?=""?numPoints="" - Retrieves sensor data from the db (not yet implemented)

## Data Manager
App that processes incoming data from the /sensors/data route.

`dataManager.recieveData` Sends data packet to processData and returns true
`dataManager.processData` Not yet implemented


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
  }
```

### Process
``` JavaScript
name: { type: String, required: [true, '[name] field required'] },
  device: {
    id: { type: Number, required: [true, '[device.id] field required'] },
    port: { type: Number, required: [true, '[device.port] field required'] },
  },
  sensors: { type: [Number], validate: [checkSensor, '[sensors] field required'] },
  loadType: { type: String, required: [true, '[loadType] field required'] },
  control: {
    type: { type: String, required: [true, '[control.type] field required'] },
    method: { type: String, required: [true, '[control.method] field required'] },
    value: { type: Number, required: [true, '[control.value] field required'] },
  },
  actions: [ActionSchema]
```

### Action
``` JavaScript
name: { type: String, required: [true, '[name] field required'] },
  port: { type: Number, required: [true, '[port] field required'] },
  action: {
    type: {
      type: String,
      required: [true, '[action.type] field required'],
      validate: [actionValueValidate, '[action.value] field required'],
    },
    value: { type: Number },
  },
  duration: { type: Number, required: [true, '[duration] field required'] },
  while: {
    sensor: Number,
    level: Number,
    invert: Boolean,
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
### Data
``` JavaScript
series: Schema.Types.ObjectId,
ownedBy: String,
prevEnd: Date,
nextStart: Date,
time: [Date],
value: [Number],
```
