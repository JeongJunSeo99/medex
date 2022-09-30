const mongoose = require("mongoose");

const ControlSchema = new mongoose.Schema({
time: {
    type: String,
},
msg: {
    type: String,
},
head_count: {
    type: Number
},
leg_count: {
    type: Number
},
serial : {
    type : String,
    required : true
}
});

module.exports = Control = mongoose.model("control", ControlSchema);