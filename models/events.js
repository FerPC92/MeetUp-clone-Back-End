let mongoose = require('mongoose');

let eventSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    eventGroup:{
        "default": "Group",
        "type": String,
        "required": true
    },
    eventName:{
        "default": "User",
        "type": String,
        "required": true
    },
    eventPlace:{
        "default": "Place",
        "type": String,
        "required": true
    },
    eventTakePlaceAt:{
        "default": "bar/home/",
        "type": String,
        "required": true
    },
    eventAdress:{
        "default": "Adress",
        "type": String,
        "required": true
    },
    eventDate:{
        "default": new Date(),
        "type": Date,
        "required": true
    },
    eventFromHour:{
        "default": 19,
        "type": Number,
        "required": true
    },
    eventToHour:{
        "default": 23,
        "type": Number,
        "required": true
    },
    eventDescription:{
        "default": "Description",
        "type": String,
        "required": true
    },
    eventImg:{
        "default": "img",
        "type": String,
        "required": true
    },
    eventOrganizer:{
        "default": "user",
        "type": String,
        "required": true
    },
    eventMembers:Array
})

module.exports = mongoose.model('Event',eventSchema)