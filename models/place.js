var mongoose = require('mongoose')
var Schema = mongoose.Schema

var PlaceSchema = new Schema ({
  name: {
    type: String,
    requied: true
  },
  category: {
    type: String,
    requied: true
  },
  subCategory: Array,
  address: String,
  city: String,
  state: String,
  zip: Number,
  phone: Number,
  website: String,
  description: String,
  popularity: {
    type: Number,
    requied: true
  },
  rating: {
    type: Number,
    requied: true
  },
  hours: Array,  // hours[0] = Sunday
  lon: {
    type: Number,
    requied: true
  },
  lat: {
    type: Number,
    requied: true
  },
  ownerEmail: {
    type: String,
    requied: true
  },
  hotelStars: Number,
  restaurantTaste: Number,
  restaurantEnv: Number,
  restaurantService: Number
})

// Setting indexes for universal search
PlaceSchema.index({ '$**': 'text' })

module.exports = mongoose.model('Place', PlaceSchema)
