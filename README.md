# Guttler-Server

-----

## Getting started

1. Clone this repo using `git clone https://github.com/guttler/Guttler-Server.git`, or clone it directly through Github client

2. Run `npm install` to install the dependencies.

3. To run the server:
   - For development and testing, install nodemon using `npm install -g nodemon`, and run `nodemon server.js` to start the server.
   - For deploying, install forever using `npm install -g forever` on AWS, and run `forever server.js` to start the server

## Accessing APIs

1. A token must be provided inside the header of the network request, the format would just be { token: XXXXXXXXXX }

2. You can access testing APIs only if you are authorized as a dev

## API Reference

1. Testing API:

 **get('/')**
 - Test route to make sure APIs are working
 - Return value: { message: 'Guttler-Server APIs are running.' }

 **post('/placesAdd')**
 - API for adding an instance to "Places" table
 - Return value: { message: 'Place added' }

 **get('/getAllPlaces')**
 - API for getting all instances from "Places" table
 - Return value: all the objects from "Places" table

2. Client API:

 **post('/placesUinversalSearch')**
 - API for universal search of "Places" table, technically it is searching inside the placesDB object in the server, explanation is below in the placesDB section
 - Return value: an array of at most 20 "Places" object

## placesDB

This is an array of objects that is updated in real time as the "Places" table. The purpose of this array is to make placesUniversalSearch() more efficient.

## Contributor

[thousight](https://github.com/thousight)
