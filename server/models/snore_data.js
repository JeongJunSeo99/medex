var mongoose = require('mongoose');
 
const Snore_data = new mongoose.Schema({
    serial: {type:String},
    snore_db1 : {type:Number},
    snore_db2 : {type:Number},
    snore_db3 : {type:Number},
    snore_db4 : {type:Number},
    snore_db5 : {type:Number},
    snore_db6 : {type:Number},
    snore_db7 : {type:Number},
    snore_db8 : {type:Number},
    snore_db9 : {type:Number},
    snore_db10 : {type:Number},
    time : {type:Number},
    min : {type:Number},
    check : {type:String}
})
 
module.exports = mongoose.model('snore_data',Snore_data);