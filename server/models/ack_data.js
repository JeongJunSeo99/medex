var mongoose = require('mongoose');
 
const Ack_data = new mongoose.Schema({
    command_type : {type:Number},
    error_type : {type:Number},
    cmd_no : {type:String}
})
 
module.exports = mongoose.model('ack_data',Ack_data);