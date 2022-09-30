const mongoose = require("mongoose"); 

const TodaySchema = new mongoose.Schema({
serial: {
    type: String,
    required: true
},
temp: {
    type: String,
    required: true
},
co2: {
    type: String,
    required: true
},
hum: {
    type: String,
    required: true
},
sleep_time: {
    type: String,
    required: true
},
snore: {
    type: Array,
    required: true
},
seq: {
    type: Number,
    required: true
}

});

module.exports = Today = mongoose.model("today", TodaySchema);