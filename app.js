const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const expressJWT = require('express-jwt');
const cors = require('cors');
const fs = require('fs')
const colors = require('colors')

const server = express();

server.use(bodyParser.json());
server.use(cors())

let User = require('./models/users')
let Event = require('./models/events')

let rawFile = fs.readFileSync('secrets.json')
const secrets = JSON.parse(rawFile)


// mongodb+srv://fer:approoTserver@meetup-gncw5.mongodb.net/test?retryWrites=true&w=majority
mongoose.connect('mongodb://localhost/meetup', {
    useNewUrlParser: true
}, (err) => {
    if (err) throw error
    console.log('conexion exitosa')


    server.post('/register', (req, res) => {
        console.log('eh recibido una peticion al endpoint / register ')
        if (req.body["userName"] != undefined && req.body["userPassword"] != undefined && req.body["userName"] != "" && req.body["userPassword"] != "") {
            let newUser = new User({
                "_id": mongoose.Types.ObjectId(),
                "userName": req.body.userName,
                "userEmail": req.body.userEmail,
                "userPassword": req.body.userPassword,
                "profile_image": req.body.profile_image,
                "isAdmin": req.body.isAdmin
            })
            User.find((err, data) => {
                if (err) {
                    console.log(err)
                }
                //let dataComplete = JSON.parse(data)
                let dataComplete = data
                let flag = false
                let usernameData;
                for (let i = 0; i < dataComplete.length; i++) {
                    if (req.body["userEmail"] === dataComplete[i]["userEmail"]) {
                        usernameData = dataComplete[i]

                    }
                }
                if (usernameData != undefined) {
                    flag = true;
                    console.log("user already exist! please Login".red)
                    res.send({
                        "message": "User already exist! please Login"
                    })

                }

                if (flag === false) {

                    //genera hash
                    bcrypt.hash(req.body["userPassword"].toString(), 10, function (err, hash) {


                        newUser["userPassword"] = hash;



                        newUser.save((err, data) => {
                            if (err) {

                                res.send({
                                    "message": err,
                                    "error": 1
                                })
                            } else {

                                console.log("usuario registrado".green)
                                res.send({
                                    "message": "User created successfully!, you can log in now"
                                })
                            }
                        }) //end writefile
                    });

                } // end if !flag




            }) //end sql

        } else {
            console.log("register incorrect".red)
            res.send({
                "message": "Parameters mustn't be empty"
            })
        }
    }) //end post 



    server.post('/login', (req, res) => {
        console.log('eh recibido una peticion al endpoint /login ')
        //compruebo que el mensaje llegue bien
        if (req.body["userEmail"] != undefined && req.body["userPassword"] != undefined && req.body["userEmail"] != "" && req.body["userPassword"] != "") {

            User.find((err, data) => {
                if (err) {
                    console.log(err)
                } //log errors
                let dataComplete = data;
                let userData;
                for (let i = 0; i < dataComplete.length; i++) {
                    if (req.body["userEmail"] === dataComplete[i]["userEmail"]) {
                        userData = dataComplete[i]
                    }
                }
                if (userData != undefined) {
                    //check if password is correct. compare hash with the one in the users.json file
                    bcrypt.compare(req.body["userPassword"], userData["userPassword"], (err, result) => {
                        if (!result) {
                            console.log("Password incorrect".red);
                            res.send({
                                "message": "Login incorrect, please check it!"
                            })
                        } else {
                            //create token
                            jwt.sign({
                                "userEmail": userData["userEmail"]
                            }, secrets["jwtKey"], (err, token) => {
                                console.log("Login correct".green)
                                res.send({
                                    "message": "Login correct",
                                    "token": token,
                                    "userID": userData["_id"],
                                    "name": userData["userName"],
                                    "admin": userData["isAdmin"]
                                })
                            })
                        }

                    }) // end bcrypt

                } else {
                    console.log("user doesnt't exist".red)
                    res.send({
                        "message": "user doesnt't exist, please register"
                    })
                }
            }) //end readfile
        } else {
            console.log("Login incorrect".red)
            res.send({
                "message": "Fields must be complete!"
            })
        }

    })

    server.get('/users', (req, res) => {
        User.find((err, data) => {
            res.send(data)
        })
    })

    server.get('/users/:id', (req, res) => {
        User.find({
            "_id": req.params.id
        }, (err, data) => {
            res.send(data)
        })
    })


    server.post('/createEvent', (req, res) => {

        if (req.body.eventName != undefined && req.body.eventPlace != undefined && req.body.eventDate != undefined && req.body.eventName != "" && req.body.eventPlace != "" && req.body.eventDate != "") {
            let newEvent = new Event({
                "_id": mongoose.Types.ObjectId(),
                "eventGroup": req.body.eventGroup,
                "eventName": req.body.eventName,
                "eventPlace": req.body.eventPlace,
                "eventTakePlaceAt": req.body.eventTakePlaceAt,
                "eventAdress":req.body.eventAdress,
                "eventDate": req.body.eventDate,
                "eventFromHour": req.body.eventFromHour,
                "eventToHour": req.body.eventToHour,
                "eventDescription": req.body.eventDescription,
                "eventImg": req.body.eventImg,
                "eventOrganizer": req.body.eventOrganizer,
                "eventMembers": req.body.eventMembers,
            })
            newEvent.save((err) => {
                if (err) throw error
                res.send({
                    "message": "Event Added"
                })
            });

        } else {
            res.send({
                "message": "Missing parameters"
            })
        }
    })

    server.get('/events', (req,res)=>{
        Event.find( (err,data)=>{
            res.send(data)
        })
    })

    server.get('/events/:id', (req,res)=>{
        Event.find({"_id": req.params.id} ,(err,data)=>{
            if(err){
                res.send({"message": "The Event Doesn't Exist"})
            } else {
            res.send(data)
            }
        })
    })


    server.put('/update', (req,res)=>{
        console.log('eh recibido una llamada al endpoint /update')
        let query = {"_id": req.body._id}
        let datosFinales = req.body
        let update = {
            $set : datosFinales
        }
        let options = {multi : true}

        Event.updateOne(query,update,options,(err,log)=>{
            if(err){
                res.send({"message": "the event doesn't exist, please check it"})
            } else{
            res.send({"message": "Successfully modified event"})
            }
        })
    })

    server.put('/addMemberToEvent', (req,res)=>{


        let userID = req.body["userID"];
        let eventID = req.body["eventID"];
        Event.findOne({"_id": eventID} ,(err,event)=>{
            
           
            let userFound = false;

                for(let i=0; i < event.eventMembers.length; i++){
                    if(userID == event.eventMembers[i]["id"])
                    userFound = true
                }

            if (userFound){  

                res.send({"message": "user already registered on event"})
               

            } else {

                User.findOne({"_id": userID} ,(err,user)=>{
                    if(err) throw err
                    event.eventMembers.push({id:userID, name:user["userName"]})
                    
                    
                    
                                
                        let query = {"_id": eventID }
                        
                        let datosFinales = event
                        let update = {
                            $set : datosFinales
                        }
                        let options = {multi : true}

                        Event.updateOne(query,update,options,(err,log)=>{
                            
                            res.send({"message": "User Added To Event Succesfully!"})
                            /* res.send(datosFinales) */
                        }) 
                
                    

                    })
                }
        })

    })

    server.put('/deleteMemberForEvent',(req,res)=>{
        
        let userID = req.body["userID"];
        let eventID = req.body["eventID"];
        Event.findOne({"_id": eventID} ,(err,event)=>{
           
            let userFound = false;

                for(let i=0; i < event.eventMembers.length; i++){
                    if(userID == event.eventMembers[i]["id"])
                    userFound = true
                }

            if (userFound){  

                User.findOne({"_id": userID} ,(err,user)=>{

                    for(let i=0; i< event.eventMembers.length; i++){
                        if(userID == event.eventMembers[i]["id"] )
                        event.eventMembers.splice([i], [i]+1)
                    }
                    
                                
                        let query = {"_id": eventID }
                        
                        
                        let update = {
                            $set : event
                        }
                        let options = {multi : true}

                        Event.updateOne(query,update,options,(err,log)=>{
                            res.send({"message": "User Removed From Event Succesfully!"})
                            /* res.send(event) */
                        }) 
                
                    

                    })

            } else {

                res.send({"message": "user already deleted from event"})

                }
        })
    })


    server.delete('/deleteEvent/:id',(req,res)=>{

         Event.findOneAndDelete({"_id":req.params.id}, (err,log)=>{
            res.send({"message": "Event deleted"})

        }) 
    })




    server.listen(3000, () => {
        console.log('escuchando en 3000')
    })



}) //end mongo