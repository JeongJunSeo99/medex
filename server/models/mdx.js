const mongoose = require("mongoose");

const MdxSchema = new mongoose.Schema({
satisf: {
    type: Number,
    required: true
},
snoring: {
    type: Number,
    required: true
},
snoringS: {
    type: Number,
    required: true
},
moving: {
    type: Number,
    required: true
},
sound: {
    type: Number,
    required: true
},
bmi: {
    type: Number,
    required: true
},
stime: {
    type: Number,
    required: true
}
});

module.exports = Mdx = mongoose.model("mdx", MdxSchema);