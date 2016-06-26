# Guttler-Server

-----

## Getting started

1. Clone this repo using `git clone https://github.com/guttler/Guttler-Server.git`, or clone it directly through Github

2. Run `npm install` to install the dependencies.

3. To run the server:
   - For development and testing, install nodemon using `npm install -g nodemon`, and run `nodemon server.js` to start the server.
   - For deploying, install forever using `npm install -g forever` on AWS, and run `forever server.js` to start the server

## Security Notes

1. A token must be provided inside the **headers** of the network request unless you are signing in or signing up, the format would just be { token: XXXXXXXXXX }

2. The type of device also must be provided inside the **headers** of the network request all the time, the format would just be { deviceType: 'Web' } or { deviceType: 'iOS' } or { deviceType: 'Android' }

3. Some APIs aren't accessible because of account type. For example, **post('/updatePlace')** is only accessible by place owners and administrators

4. Token refreshing rules:

  - It should always be refreshed when password is changed **( Need to be implemented in all clients )**

  - Web: It should be refreshed when the user opens the web homepage and every one hour **( Need to be implemented in all clients )**

  - App: Token never expires

## API Reference

### Client API:

1. Server status checking APIs

 **get('/')**
 - Test route to make sure APIs are running
 - **Parameters:** none
 - **Return value:** message indicating successful connection

2. Authentication APIs

  **get('/refreshToken')**
  - API for refreshing a token
  - **Parameters:** none, just make sure token is still valid and both token and deviceType are stored in req.headers
  - **Return value:** renewed token containing user's information

 **post('/signInWithEmail')**
 - Normal sign in method with a unique email and password
 - **Parameters:** email and password
 - **Return value:** token containing user's information

 **post('/signUpWithEmail')**
 - Normal sign up method that require many other fields
 - **Parameters:** email password nickname gender DOB(Date of Birth) hometown
 - **Return value:** token containing user's information

3. Place APIs

 **post('/addPlace')**
 - API for adding an instance to "Places" table
 - **Parameters:** object containing info of the place
 - **Return value:** message indicates success

 **post('/getPlacesByCity')**
 - API for getting the most popular 20 places in the city
 - **Parameters:** city
 - **Return value:** an object of at most 20 "Places" object

 **post('/searchPlaces')**
 - API for text search of "Places" table
 - **Parameters:** terms: the user input, lon and lat: longitude and latitude of a geolocation, can be user's current location or user's selected location on the map
 - **Return value:** an **array** of at most 20 "Places" object

 **post('/getPlaceById')**
 - API for getting a specific place with ID
 - **Parameters:** the place's id
 - **Return value:** an object containing the place's information

 **post('/updatePlace')**
 - API for updating a specific place
 - **Parameters:** the entire (not just updated fields) updated object of the place, make sure you include its ID
 - **Return value:** message indicating successful update


 More to come...

### Testing API:

 There aren't any yet...

## Contributor

[thousight](https://github.com/thousight)
