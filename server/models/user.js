const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
id: {
    type: String,
    required: true,
    unique : true
},
phone_number: {
    type: String,
    required: true
},
birth: {
    type: String,
    required: true
},
password: {
    type: String,
    required: true
},
gender: {
    type: String,
    required: true
},
weight: {
    type: String,
    required: true
},
height: {
    type: String,
    required: true
},
sleeptime: {
    type: String,
    required: true
},
wakeuptime: {
    type: String,
    required: true
},
sickness: {
    type: String,
    required: true
},
serialnum: {
    type: String,
    required: true
},
satisfaction: {
    type: String,
    required: true
},
name: {
    type: String,
    required: true
},
});

module.exports = User = mongoose.model("user", UserSchema);