var mongoose = require('mongoose');
 
const Bed_data = new mongoose.Schema({
    mh_sn : {type:String,required: true},
    head_count : {type:Number},
    foot_count : {type:Number},
    time : {type:Number,required: true},
    bed_status: {type:Number}
})
 
module.exports = mongoose.model('bed_data',Bed_data);