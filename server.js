/** ***************************** Guttler Server Script **************************** **/
/** ******************************************************************************** **/

/** ****************************** Base Package Setup ****************************** **/
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var firebase = require('firebase')
// Setting firebase credentials and database address
firebase.initializeApp({
  serviceAccount: './serviceAccountCredentials.json',
  databaseURL: 'https://guttler-server.firebaseio.com/'
})
// Connecting to firebase database and get the reference of each data object type
var db = firebase.database()
var placeRef = db.ref('/Places')
// Configure app to use bodyParser(), which will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

/** ************************************* APIs ************************************* **/
// Route for api
var api = express.Router()
// TODO: Middleware to verify token, it will be called everytime a request is sent to API
api.use(function (req, res, next) {
  console.log('A request is coming in.')
  next()
})
// Test route to make sure APIs are working
api.get('/', (req, res)=> {
  res.json({ message: 'Guttler-Server APIs are running.' })
})
// API for adding an instance to "Places" table
// TODO: Figure out how to add Chinese characters
api.post('/placesAdd', (req, res)=> {
  placeRef.push({
    name: req.headers.name,
    category: req.headers.category,
    subcategory: req.headers.subcategory,
    address: req.headers.address,
    city: req.headers.city,
    state: req.headers.state,
    zip: req.headers.zip,
    phone: req.headers.phone,
    website: req.headers.website,
    description: req.headers.description
  })
  res.json({ message: 'Place added' })
})
// TODO: API for universal search
// First retrieve all the objects from firebase
// Next try to search all of the objects based on the keywords
// And sort of the first 20 objects by distance from the appointed geolocation
api.get('/placesUniversalSearch'), (req, res)=> {

}
// Registering out routes, all of our routes will be prefixed with /api
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
