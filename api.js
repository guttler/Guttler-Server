/** **************************** Guttler Server API Page *************************** **/
/** ******************************************************************************** **/


/** ****************************** Base Package Setup ****************************** **/
var jwt = require('jsonwebtoken')
var secret = 'Purdue University'
var User = require('./models/user')
var Place = require('./models/place')


/** ************************* Global Variables & Functions ************************* **/
// Fields used when creating users
var userFields = 'email password nickname gender DOB hometown experience level accountType loginMethod'

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
    expiresIn: '1h'
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
// Function for trimming white spaces on both sides of the string, used in api.post('/placesUniversalSearch')
var trim = x=> {
  return x.replace(/^\s+|\s+$/gm,'');
}
// Function for comparing 2 json objects, used in itemExists()
var compareObjects = (o1, o2)=> {
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
var itemExists = (haystack, needle)=> {
  for (var i = 0; i < Object.keys(haystack).length; i++) {
    if (compareObjects(haystack[i], needle)) {
      return true
    }
  }
  return false
}
// Function for searching a specific term in an array of objects, used in api.post('/placesUniversalSearch')
var searchFor = (term, allData)=> {
  var results = []
  for (var j = 0; j < term.length; j++) {
    for (var i = 0; i < allData.length; i++) {
      for (var key in allData[i]) {
        if (allData[i][key].indexOf(term[j])!=-1) {
          if (!itemExists(results, allData[i])) {
            results.push(allData[i])
          }
        }
      }
    }
  }
  return results
}
// Function for turning Degress to Radius, used in getDistanceFromLatLonInKm()
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
  for (i = 0; i < allData.length; i++) {
    for (j = 0; j < (allData.length - i - 1); j++) {
      if (getDist(lat, lon, allData[j].lat, allData[j].lon) > getDist(lat, lon, allData[j+1].lat, allData[j+1].lon)) {
        temp = allData[j]
        allData[j] = allData[j+1]
        allData[j+1] = temp
      }
    }
  }
  for (i = 0; i < 20; i++) {
    results[i] = allData[i]
  }
  return results
}


/** ************************************* APIs ************************************* **/
module.exports = (app, express)=> {
  // Route for api
  var api = express.Router()
  // Test route to make sure APIs are working
  api.get('/', (req, res)=> {
    res.json({ message: 'Guttler-Server APIs are running.' })
  })

  // User:
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

  // Place:
  // API for adding an instance to "Places" table
  api.post('/addPlace', auth, (req, res)=> {
    var place = new Place({
      name: req.body.name,
      category: req.body.category,
      subCategory: req.body.subCategory,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      phone: req.body.phone,
      website: req.body.website,
      description: req.body.description,
      popularity: req.body.popularity,
      rating: req.body.rating,
      hours: req.body.hours,
      lon: req.body.lon,
      lat: req.body.lat,
      ownerEmail: req.body.ownerEmail,
      hotelStars: req.body.hotelStars,
      restaurantTaste: req.body.restaurantTaste,
      restaurantEnv: req.body.restaurantEnv,
      restaurantService: req.body.restaurantService
    })
    place.save((err, newPlace)=> {
      if (err) {
        res.send(err)
        return
      }
      res.json({ message: 'New place added'})
    })
  })

  // TODO: API for universal search
  api.post('/placesUniversalSearch', (req, res)=> {
    if (!req.body.term) {
      res.json({ message: 'Please input some terms' })
      return
    } else if (!(req.body.lon && req.body.lat)) {
      res.json({ message: 'Please include longitude and latitude' })
      return
    } else {
      // Get the terms, trim the white spaces around the terms, and separate all the words inside terms into an array
      var terms = trim(req.body.term).split(' ')
      // Search for all of the objects based on the terms
      var allData = searchFor(terms, placesDB)
      // And get the first 20 objects by distance from the appointed geolocation
      if (allData.length > 20) {
        allData = getPlacesNearby(req.body.lat, req.body.lon, allData)
      }
      // Sort the array of results by ratings in desc and respond
      res.json(allData.sort(function(a,b) {return (a.rating > b.rating) ? 1 : ((b.rating > a.rating) ? -1 : 0);} ).reverse())
    }
  })

  return api
}
