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
``` Javascript
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
