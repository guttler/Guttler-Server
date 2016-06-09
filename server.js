/**************************** Guttler Main Server Script ****************************/
/************************************************************************************/


/******************************** Base Package Setup ********************************/
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var firebase = require("firebase");

// Setting firebase credentials and database address
firebase.initializeApp({
  serviceAccount: "./serviceAccountCredentials.json",
  databaseURL: "https://guttler-server.firebaseio.com/"
});

// configure app to use bodyParser(), which will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


/*************************************** APIs ***************************************/
// Routes for api
var router = express.Router();

// Middleware to verify token(to be implemented...), it will be called everytime a request is sent to API
router.use(function(req, res, next) {
    console.log('A request is coming in.');
    next();
});

// Test route to make sure APIs are working
router.get('/', function(req, res) {
    res.json({ message: 'Guttler-Server APIs are running.' });
});

// Registering out routes, all of our routes will be prefixed with /api
app.use('/', router);


/********************************** Server Running **********************************/
var port = process.env.PORT || 3000;
app.listen(port, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Listening on port " + port + ".");
  }
});
