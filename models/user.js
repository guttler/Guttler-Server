var mongoose = require('mongoose')
var Schema = mongoose.Schema
var bcrypt = require('bcrypt-nodejs')

var UserSchema = new Schema ({
  email: {
    type: String,
    requied: true,
    index: {
      unique: true
    }
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  nickname: String,
  gender: String,
  DOB: Date,
  hometown: String,
  experience: Number,
  level: Number,
  accountType: String,
  loginMethod: String
})

// Password encryption middleware, if things don't work, then don't use ES6 syntax
UserSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next()
  }
  bcrypt.hash(this.password, null, null, (err, hash)=> {
    if (err) {
      return next(err)
    }
    this.password = hash
    next()
  })
})

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model('User', UserSchema)
