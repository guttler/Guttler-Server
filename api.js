/** **************************** Guttler Server API Page *************************** **/
/** ******************************************************************************** **/


/** ****************************** Base Package Setup ****************************** **/
var jwt = require('jsonwebtoken')
var secret = 'Purdue University'
var User = require('./models/user')
var Place = require('./models/place')
// Fields used when creating users
var userFields = 'email password nickname gender DOB hometown experience level accountType loginMethod'


/** ************************************* APIs ************************************* **/
module.exports = (app, express)=> {
  // Route for api
  var api = express.Router()
  // Test route to make sure APIs are working
  api.get('/', (req, res)=> {
    res.json({ message: 'Guttler-Server APIs are running.' })
  })

  // ********************* User: ********************* //
  // Sign In with email API
  api.post('/signInWithEmail', (req, res)=> {
    User.findOne({
      email: req.body.email
    }).select(userFields).exec((err, user)=> {
      if(err) {
        throw err
      }
      if (!user) {
        res.send({ message: "User doesn't exist"});
      } else if (user) {
        var validPassword = user.comparePassword(req.body.password);
        if (!validPassword) {
          res.send({ message: "Invalid Password"});
        } else {
          var token = createToken(user);
          res.json({
            success: true,
            message: "Login Successfully!",
            token: token
          })
        }
      }
    })
  })
  // Sign Up with email API
  api.post('/signUpWithEmail', (req, res)=> {
    var user = new User({
      email: req.body.email,
      password: req.body.password,
      nickname: req.body.nickname,
      gender: req.body.gender,
      DOB: req.body.DOB,
      hometown: req.body.hometown,
      experience: req.body.experience,
      level: req.body.level,
      accountType: req.body.accountType,
      loginMethod: req.body.loginMethod
    })
    var token = createToken(user)
    user.save(err=> {
      if (err) {
        res.send(err)
        return
      }
      res.json({
        success: true,
        message: 'User created!',
        token: token
      })
    })
  })

  // ******************** Place: ********************* //
  // API for adding an instance to "Places" table
  api.post('/addPlace', auth, (req, res)=> {
    var place = new Place(placeReqModel(req.body))
    place.save((err, newPlace)=> {
      if (err) {
        res.send(err)
        return
      }
      res.json({ message: 'New place added'})
    })
  })
  // API for getting the most popular 20 places in the city
  api.post('/getPlacesByCity', auth, (req, res)=> {
    if (!req.body.city) {
      res.json({ message: 'Please input a city name' })
      return
    } else {
      Place.find({ city: req.body.city }).sort({ popularity: 'desc' }).limit(20).exec((err, places)=> {
        if (err) {
          res.send(err)
          return
        }
        res.json(places)
      })
    }
  })
  // API for places universal search
  api.post('/searchPlaces', auth, (req, res)=> {
    if (!req.body.terms) {
      res.json({ message: 'Please input some terms' })
      return
    } else if (!(req.body.lon && req.body.lat)) {
      res.json({ message: 'Please include longitude and latitude' })
      return
    } else {
      // Get the terms, trim the white spaces around the terms, and separate all the words inside terms into an array
      var terms = trim(req.body.terms).split(' ')
      // Search for all of the objects based on the terms
      var results = searchFor(terms)
      if (results.name === 'error') {
        res.send(results.error)
      }
      // And get the first 20 objects by distance from the appointed geolocation
      if (results.length > 20) {
        results = getPlacesNearby(req.body.lat, req.body.lon, places)
      }
      // Sort the array of results by ratings in descending order and respond
      res.json(results.sort((a,b)=> { return (a.rating > b.rating) ? 1 : ((b.rating > a.rating) ? -1 : 0) }).reverse())
    }
  })
  // API for getting a place with ID
  api.post('/getPlaceById', auth, (req, res)=> {
    if (!req.body._id) {
      res.json({ message: 'Fail: please input _id' })
    } else {
      Place.find({ _id: req.body._id }, (err, place)=> {
        if (err) {
          res.json({ message: "Place doesn't exist" })
        }
        res.json(place)
      })
    }
  })
  // API for updating places
  api.post('/updatePlace', authOwner, (req, res)=> {
    if (!req.body._id) {
      res.json({ message: 'Please include _id inside the body' })
      return
    }
    var updateData = placeReqModel(req.body)
    Place.update( { _id: req.body._id }, { $set: updateData }, (err, message)=> {
      if (err) {
        res.send(err)
        return
      }
      res.json({ message: 'Place updated' })
    })
  })

  return api
}


/** ******************************* Global Functions ******************************* **/
// Function that creates tokens for users with jsonwebtoken
var createToken = user=> {
  var token = jwt.sign({
    email: user.email,
    nickname: user.nickname,
    gender: user.gender,
    DOB: user.DOB,
    hometown: user.hometown,
    experience: user.experience,
    level: user.level,
    accountType: user.accountType
  }, secret, {
    expiresIn: '24h'
  })
  return token
}
// Function to verify token, it will be called on specific APIs that need to be secured
var auth = (req, res, next)=> {
  var token = req.headers.token
  if (token) {
    jwt.verify(token, secret, (err, decoded)=> {
      if (err) {
        res.status(403).send({ success: false, message: "Failed to authenticate user." })
      } else {
        req.decoded = decoded
        next()
      }
    })
  } else {
    res.status(403).send({ success: false, message: "No Token Provided." })
  }
}
// Function to verify token and see if the user is an owner, it will be called on specific APIs that need to be secured
var authOwner = (req, res, next)=> {
  var token = req.headers.token
  if (token) {
    jwt.verify(token, secret, (err, decoded)=> {
      if (err) {
        res.status(403).send({ success: false, message: "Failed to authenticate user." })
      } else {
        if (decoded.accountType == 'owner' || decoded.accountType == 'admin') {
          req.decoded = decoded
          next()
        } else {
          res.status(403).send({ success: false, message: "User is not an owner or admin" })
        }
      }
    })
  } else {
    res.status(403).send({ success: false, message: "No Token Provided." })
  }
}
// Function for turning Degress to Radius, used in getDist()
var deg2rad = (deg)=> {
  return deg * (Math.PI / 180)
}
// Function for calculating the shortest distance over the earth’s surface between 2 points, used in getPlacesNearby()
var getDist = (lat1, lon1, lat2, lon2)=> {
  var R = 6371 // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1)  // deg2rad above
  var dLon = deg2rad(lon2 - lon1)
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in km
}
// Function for finding the closest 20 places near a certain location, used in api.post('/placesUniversalSearch')
var getPlacesNearby = (lat, lon, allData)=> {
  var temp = {}
  var results = []
  var count, i, j = 0
  // Filter out the closest 20 places
  // Bubble sort all of the places by their distances from the location
  for (i = 0; i < allData.length; i++) {
    for (j = 0; j < (allData.length - i - 1); j++) {
      if (getDist(lat, lon, allData[j].lat, allData[j].lon) > getDist(lat, lon, allData[j+1].lat, allData[j+1].lon)) {
        temp = allData[j]
        allData[j] = allData[j+1]
        allData[j+1] = temp
      }
    }
  }
  // Only return the closest 20 places
  for (i = 0; i < 20; i++) {
    results[i] = allData[i]
  }
  return results
}
// Function for trimming white spaces on both sides of the string, used in api.post('/placesUniversalSearch')
var trim = x=> {
  return x.replace(/^\s+|\s+$/gm,'');
}
// Function for checking if an item exists by comparing _id, used in searchFor()
var itemExists = (haystack, needle)=> {
  for (var i = 0; i < Object.keys(haystack).length; i++) {
    if (haystack[i]['_id'].toString() === needle['_id'].toString()) {
      return true
    }
  }
  return false
}
// TODO: Fix the empty returned result[] due to async
// Function to search for all of the objects based on the terms
var searchFor = terms=> {
  var results = []
  for (var j = 0; j < terms.length; j++) {
    var term = new RegExp(terms[j], 'i')
    Place.find({ $or: [
      {name: term}, {category: term}, {subCategory: term},
      {address: term}, {city: term}, {state: term}, {zip: term},
      {description: term}, {hours: term}
    ] }, (err, places)=> {
      if (err) {
        return {
          name: 'error',
          error: err
        }
      } else {
        for (var i in places) {
          if (!itemExists(results, places[i].toObject())) {
            results.push(places[i].toObject())
          }
        }
      }
    })
  }
  return results
}
// Network request model for Place, ususally input req.body as it's parameter
var placeReqModel = place=> {
  return {
    name: place.name,
    category: place.category,
    subCategory: place.subCategory,
    address: place.address,
    city: place.city,
    state: place.state,
    zip: place.zip,
    phone: place.phone,
    website: place.website,
    description: place.description,
    popularity: place.popularity,
    rating: place.rating,
    hours: place.hours,
    lon: place.lon,
    lat: place.lat,
    ownerEmail: place.ownerEmail,
    hotelStars: place.hotelStars,
    restaurantTaste: place.restaurantTaste,
    restaurantEnv: place.restaurantEnv,
    restaurantService: place.restaurantService
  }
}
