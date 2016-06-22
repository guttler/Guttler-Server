# Guttler-Server

-----

## Getting started

1. Clone this repo using `git clone https://github.com/guttler/Guttler-Server.git`, or clone it directly through Github client

2. Run `npm install` to install the dependencies.

3. To run the server:
   - For development and testing, install nodemon using `npm install -g nodemon`, and run `nodemon server.js` to start the server.
   - For deploying, install forever using `npm install -g forever` on AWS, and run `forever server.js` to start the server

## Accessing APIs

1. A token must be provided inside the **headers** of the network request unless you are signing in or signing up, the format would just be { token: XXXXXXXXXX }

2. You can access testing APIs only if you are authorized as a dev (for now there aren't any yet...)

## API Reference

1. Client API:

 **get('/')**
 - Test route to make sure APIs are running
 - Return value: { message: 'Guttler-Server APIs are running.' }

 **post('/signInWithEmail')**
 - Normal sign in method with a unique email and password
 - Return value: { message: "Login Successfully!", token: token }

 **post('/signUpWithEmail')**
 - Normal sign up method that require many other fields
 - Return value: { message: 'User created!', token: token }

 **post('/addPlace')**
 - API for adding an instance to "Places" table
 - Return value: { message: 'Place added' }

 **post('/placesUniversalSearch')**
 - API for text search of "Places" table
 - Return value: an array of at most 20 "Places" object

 More to come...

2. Testing API:

 There aren't any yet...

## Contributor

[thousight](https://github.com/thousight)
