/**************************** Guttler Main Server Script ****************************/
/************************************************************************************/


/******************************** Base Package Setup ********************************/
var express = require('express');
var app = express();
var firebase = require("firebase");
var bodyParser = require("body-parser");

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
// Test route to make sure api is working
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
