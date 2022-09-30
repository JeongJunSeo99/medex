var mongoose = require('mongoose');
 
const Schema = mongoose.Schema;
 
const Connect = new Schema({
    mh_sn : {type:String},
})
 
module.exports = mongoose.model('connect',Connect);