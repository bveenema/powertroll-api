'use strict'
let express       = require('express'),
    expressConfig = require('../config/express.config.js'),
    jsonParser    = require('body-parser').json,
    logger        = require('morgan'),
    routes        = require('./routes/index.js')

let app = express()

app.use(logger('dev'))
app.use(jsonParser())

app.use('/',routes)

let mongoose     = require("mongoose")

let mongoConfig = ''

if(process.env.NODE_ENV === 'test') {
  mongoConfig  = require('../config/mongoTest.config.js').uri
}else {
  mongoConfig  = require('../config/mongo.config.js').uri
}



mongoose.connect(mongoConfig)

let dataBase = mongoose.connection

dataBase.on("error", function(err){
	console.error("connection error:", err)
});

dataBase.once("open", function(){
	console.log("db connection successful")
});


// Error Handler
app.use(function(err, req, res, next){
	res.status(err.status || 500);
	res.json({
		error: {
			message: err.message
		}
	});
});

app.listen(expressConfig.port, function () {
  console.log('Example app listening on port '+ expressConfig.port + '!');
});

module.exports = app //for testing
