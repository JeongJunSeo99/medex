var mongoose = require('mongoose');
 
const E_d = new mongoose.Schema({
    mh_sn : {type:String},
    ev_temp : {type:Number},
    ev_hum : {type:Number},
    ev_co2 : {type:Number},
    in_snore : {type:Number},
    time : {type:Number}
})
 
module.exports = mongoose.model('enviroment_data',E_d);