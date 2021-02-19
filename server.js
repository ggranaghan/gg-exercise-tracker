const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const path = require('path');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))

//initiate database
mongoose.connect(process.env.MONGO_URI,  { useNewUrlParser: true, useUnifiedTopology: true })
const UserSchema = new mongoose.Schema({
    username: String,
    id: String,
    count: {
      type: Number,
      default: 0
    },
    log: [{
      description: String,
      duration: Number,
      date: { 
        type: Date, 
        default: Date.now() }
    }],
  })
const User = mongoose.model('User', UserSchema);
console.log("db connected")


//new user post
app.post('/api/exercise/new-user', function (req, res) {
  var newUser = new User({
    username: req.body.username,
    id: req.body.id,
    count: 0
  })
  newUser.save((err) => {
    if (err) return console.log(err)
  })
  res.json({
    username: newUser.username,
    id: newUser._id
  })
})

//add excercise
app.post('/api/exercise/add', function (req, res) {
  let userId = req.body.userId;
  User.findByIdAndUpdate(userId,
    { 
      $inc: {
        count:1
      },
      $push: {
        log: {
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date ? req.body.date : Date.now()
        }
      }
    },
     {new: true},
     function (err, user) {
      let logLength = user.log.length-1
      return res.send({
        id: user._id,
        username: user.username,
        date: user.log[logLength].date,
        duration: user.log[logLength].duration,
        description: user.log[logLength].description
      });
    }
  )
}) 

//get all users
app.get('/api/exercise/users', function (req, res) {
  User.find(function(err, users) {
    if (err) console.log(err)
    res.json(users)
  })
})

//get user log
app.get('/api/exercise/log', function (req, res) {
 let id = req.query.userId
 let limit = parseInt(req.query.limit)
 User.findOne({_id: id}, { "log": { $slice: limit } }, function(err, users) {
  if (err) console.log(err)
  res.json(users)
})
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT || 3001, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
