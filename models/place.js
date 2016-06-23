var mongoose = require('mongoose')
var Schema = mongoose.Schema

var PlaceSchema = new Schema ({
  name: String,
  category:String,
  subCategory: Array,
  address: String,
  city: String,
  state: String,
  zip: String,
  phone: Number,
  website: String,
  description: String,
  popularity: Number,
  rating: Number,
  hours: Array,  // hours[0] = Sunday
  lon: {
    type: Number,
    requied: true
  },
  lat: {
    type: Number,
    requied: true
  },
  ownerEmail: String,
  hotelStars: Number,
  restaurantTaste: Number,
  restaurantEnv: Number,
  restaurantService: Number
})

module.exports = mongoose.model('Place', PlaceSchema)
