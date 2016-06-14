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

/** ******************************* Global Functions ******************************* **/
// Function for trimming white spaces on both sides of the string, used in api.post('/placesUniversalSearch')
function trim(x) {
    return x.replace(/^\s+|\s+$/gm,'');
}
// Function for comparing 2 json objects, used in itemExists()
function compareObjects(o1, o2) {
  var k = ''
  for (k in o1) {
    if (o1[k] != o2[k]) {
      return false
    }
  }
  for (k in o2) {
    if(o1[k] != o2[k]) {
      return false
    }
  }
  return true
}
// Function for checking if an item exists, used in searchFor()
function itemExists(haystack, needle) {
  for (var i = 0; i < Object.keys(haystack).length; i++) {
    if (compareObjects(haystack[i], needle)) {
      return true
    }
  }
  return false
}
// Function for searching a specific term in a json object, used in api.post('/placesUniversalSearch')
function searchFor(term, allData) {
  var results = []
  for (var i in allData) {
    for (var key in allData[i]) {
      if (allData[i][key].indexOf(term)!=-1) {
        if (!itemExists(results, allData[i])) {
          results.push(allData[i])
        }
      }
    }
  }
  return results
}
// Function for modify the Firebase data package so that the id of each object is within the object, used in api.post('/placesUniversalSearch')
function insertID(rawData) {
  // Getting all the IDs into an array
  var IDs = Object.keys(rawData)
  var i = 0
  // Insert them into the object
  for (var keys in rawData) {
    rawData[keys]['id'] = IDs[i]
    i++
  }
  return rawData
}

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
// API for adding an instance to "Places" table, created for testing purposes, don't use it for client
api.post('/placesAdd', (req, res)=> {
  placeRef.push({
    name: req.body.name,
    category: req.body.category,
    subcategory: req.body.subcategory,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    phone: req.body.phone,
    website: req.body.website,
    description: req.body.description
  })
  res.json({ message: 'Place added' })
})
// API for getting all instances from "Places" table, created for testing purposes, don't use it for client
api.get('/getAllPlaces', (req, res)=> {
  placeRef.on("value", snapshot=> {
    res.json(snapshot.val())
  }, errorObject=> {
    console.log("All places retrieval failed: " + errorObject.code)
  })
})
// API for universal search
api.post('/placesUniversalSearch', (req, res)=> {
  if (!req.body.term) {
    res.json({ message: '' })
    return
  }
  const term = trim(req.body.term)
  // First retrieve all the objects from Firebase
  placeRef.on("value", snapshot=> {
    var allData = snapshot.val()
    // Then modify the data package so that the id of each object is within the object
    allData = insertID(allData)
    // Next try to search all of the objects based on the term
    allData = searchFor(term, allData)
    // And sort of the first 20 objects by distance from the appointed geolocation
    // TODO: Implement the step
    res.json(allData)
  }, errorObject=> {
    console.log("All places retrieval failed: " + errorObject.code)
  })
})
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
