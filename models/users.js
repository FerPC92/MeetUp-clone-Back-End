let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    userName:String,
    userEmail:String,
    userPassword:String,
    profile_image: {
        "default": "https://secure.meetupstatic.com/img/noPhoto_50.png",
        "type": String,
        "required": false
    },
    isAdmin: {
        "default": 0,
        "type":Number,
        "required": false
    }
})

module.exports = mongoose.model('User',userSchema)