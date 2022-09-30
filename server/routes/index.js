var express = require('express');
var motion_bed = require('./motion_bed');
 
const router = express.Router();
router.use('/motion_bed',motion_bed);
 
module.exports =  router;