const mongoose = require("mongoose"); 

const S_chSchema = new mongoose.Schema({
serial: {
    type: String,
    required: true
},
time: {
    type : String,
    required: true
}

});

module.exports = s_ch = mongoose.model("s_ch", S_chSchema);