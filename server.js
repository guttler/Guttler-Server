/** ***************************** Guttler Server Script **************************** **/
/** ******************************************************************************** **/

/** ****************************** Base Package Setup ****************************** **/
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var morgan = require('morgan')
var mongoose = require('mongoose')
var api = require('./api')(app, express)
// Connecting to MongoDB
var dbAddress = 'mongodb://markwen:987654321@ds045622.mlab.com:45622/guttler-testingdb'
mongoose.connect(dbAddress, err=> {
  if (err) {
    console.log(err)
  } else {
    console.log('Connected to MongoDB')
  }
})
// Configure app to use bodyParser(), which will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(morgan('dev'))
// Registering out routes
app.use('/', api)

/** ******************************** Server Running ******************************** **/
var port = process.env.PORT || 3000
app.listen(port, err=> {
  if (err) {
    console.log(err)
  } else {
    console.log('Listening on port ' + port + '.')
  }
})
