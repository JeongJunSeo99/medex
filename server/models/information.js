var mongoose = require('mongoose');
 
const Information = new mongoose.Schema({
    category : {type:String},
    content : {type:String}
})
 
module.exports = mongoose.model('information',Information);