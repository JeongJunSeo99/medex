var mongoose = require('mongoose');
const File = new mongoose.Schema({
    serial : {type:String},
    origin_name : {type:String},
    dest_name: {type:String},
    path : {type:String},
    time : {type:Number}
})
module.exports = mongoose.model('file',File);