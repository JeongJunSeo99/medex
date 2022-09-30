var mongoose = require('mongoose');
 
const Pose_data = new mongoose.Schema({
    mh_sn : {type:String},
    pitch_angle : {type:Number},
    roll_angle : {type:Number},
    pose_type : {type:Number},
    time : {type:Number}
})
 
module.exports = mongoose.model('pose_data',Pose_data);