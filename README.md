# powertroll-api
## Description
The API that interacts with the [web app](https://github.com/bveenema/powertroll-web-app), database and Trolls.

## Configuration
Requires Configuration files that are not tracked in GIT for security
### express.config.js
``` JavaScript
let config = {}

config.port = <XXXX>

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
ownedBy: { type: Number, required: [true, 'Device owner required'] },
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

DeviceSchema.virtual('sensors.local').get(() => this.sensors.wired.concat(this.sensors.wireless))
```
