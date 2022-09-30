const express = require("express");
const User = require("../models/user");
const Bed = require("../models/bed");
const Mat = require("../models/mat_data");
const Information = require("../models/information");
const Today = require("../models/today");
const Enviroment_data = require("../models/enviroment_data");
const Snore_data = require("../models/snore_data");
const File = require("../models/file");
const router = express.Router();           
const mongoose = require("mongoose");
const multer = require("multer");
const schedule = require('node-schedule');
const { PythonShell }= require("python-shell");
var fs = require("fs");


router.post("/snore", async (req, res) => { 
    try { // id 비교 
        serial = req.body.serialnum

        let day = new Date(); // 현재 시간 구하는 함수
        let cur_time = day.getTime();
        let min = day.getMinutes();
        let c = 1;
        snore = new Snore_data({
            serial : serial,
            min : min,
            time : cur_time,
            snore_db1 : req.body.snore_db1,
            snore_db2 : req.body.snore_db2,
            snore_db3 : req.body.snore_db3,
            snore_db4 : req.body.snore_db4,
            snore_db5 : req.body.snore_db5,
            snore_db6 : req.body.snore_db6,
            snore_db7 : req.body.snore_db7,
            snore_db8 : req.body.snore_db8,
            snore_db9 : req.body.snore_db9,
            snore_db10 : req.body.snore_db10,
            check : c
        });

        const saveSnore_data=await snore.save();
        const r1 = {
            code: 200,
            msg: 'sucess'
        };
        res.send(r1);
        
    } 
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };
        res.send(result);
    } 
});

router.post("/en", async (req, res) => { 
    try { // id 비교 
        serial = req.body.serialnum

        let day = new Date(); // 현재 시간 구하는 함수
        //let cur_time = day.toLocaleString();
        let cur_time = day.getTime();

        en = new Enviroment_data({
            serial : serial,
            ev_temp : 20,
            ev_hum: 20,
            ev_co2 : 10,
            time : cur_time
            });

        const saveEnviroment_data=await en.save();
        const r1 = {
            code: 200,
            msg: 'sucess'
        };
        res.send(r1);
        
    } 
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };
        res.send(result);
    } 
});

router.post("/mat", async (req, res) => { 
    try { // id 비교 
        serial = req.body.serialnum

        let day = new Date(); // 현재 시간 구하는 함수
        //let cur_time = day.toLocaleString();
        let cur_time = day.getTime();

        mat = new Mat({
            mh_sn : serial,
            ble_connect : "a",
            current_temp : req.body.cur, /*default, max, unique ... */
            setting_temp : req.body.set,
            off_time : 1,
            on_time : 1,
            mode : 1,
            cover: 1,
            water_level: 1,
            pump: 1,
            heater: 1,
            error: 1,
            time : cur_time,
            s_day : 0
            });

        const saveMat=await mat.save();
        const r1 = {
            code: 200,
            msg: 'sucess'
        };
        res.send(r1);
        
    } 
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };
        res.send(result);
    } 
});

module.exports = router; 