var express = require('express');
var Motion_Bed = require('../models/motion_bed');
var mongoose = require('mongoose');

/*
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://localhost');

client.on('message', function (topic, message) {
  data = JSON.parse(message);

  let motion_bed = new Motion_Bed({
    connect : {
      mh_sn : data.connect.mh_sn
      },
      server_time :{
      command_type : data.server_time.command_type,
      time : data.server_time.time
      }
 });
*/

const router = express.Router();
 
router.post('/', (req, res) => {
  if (req.body.username === "") {
    return res.status(400).json({
      error: "EMPTY USERNAME",
      code: 2
    });
  }
 
  if (req.body.contents === "") {
    return res.status(400).json({
      error: "EMPTY CONTENTS",
      code: 2
    });
  }
 
  motion_bed.save(err => {
    if (err) throw err;
    return res.json({ success: true });
  });
});
 
module.exports = router

