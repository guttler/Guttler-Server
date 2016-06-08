/**************************** Guttler Main Server Script ****************************/
var firebase = require("firebase");

// Setting firebase credentials and database address
firebase.initializeApp({
  serviceAccount: "./serviceAccountCredentials.json",
  databaseURL: "https://guttler-server.firebaseio.com/"
});
