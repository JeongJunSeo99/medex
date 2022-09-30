const mongoose = require("mongoose");

const BedSchema = new mongoose.Schema({
    time: {
        type: String
    },
    msg: {
        type: String,
        //required: true
    },
    wake_seq: {
        type: Number,
        //required: true
    },
    sleep_seq: {
        type: Number,
        //required: true
    },
    serial: {
        type: String,
        //required: true
    }
});

module.exports = Bed = mongoose.model("bed", BedSchema);