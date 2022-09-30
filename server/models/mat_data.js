var mongoose = require('mongoose');
 
const Mat_data = new mongoose.Schema({
    mh_sn : {type:String},
    ble_connect : {type:String},
    current_temp : {type:Number, /*default, max, unique ... */},
    setting_temp : {type:Number},
    off_time : {type:Number},
    on_time : {type:Number},
    mode : {type:Number},
    cover: {type:Number},
    water_level: {type:Number},
    pump: {type:Number},
    heater: {type:Number},
    error: {type:Number},
    time : {type:Number},
    s_day : {type:Number}
})
 
module.exports = mongoose.model('mat_data',Mat_data);