const express = require("express");
const User = require("../models/user");
const Bed = require("../models/bed");
const Mat_data = require("../models/mat_data");
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
var gaussian = require('../ran/gaussian');

router.post("/ga", async (req, res) => { 
    try { // id 비교 
        var distribution = gaussian(880, 40);
    // Take a random sample using inverse transform sampling method.
        var sample = distribution.random(100);

        console.log(sample[1]);
        
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


router.post("/snore", async (req, res) => { 
    try { // id 비교 
        let time1 = req.body.t1;
        var time2 = req.body.t2;
        var i = time1;
        var c = req.body.ch;

        var distribution = gaussian(880, 40);
        var sample = distribution.random(100000);
        Math.floor(sample);
        var j = 0;

        console.log(sample);

        for(i ; i<time2 ; i+=3000){
            const date = new Date(i);
            let min = date.getMinutes();

            var mat_time = i.toString();

            snore = new Snore_data({
                serial : "H10000000000",
                min : min,
                time : mat_time,
                snore_db1 : Math.floor(sample[j]),
                snore_db2 : Math.floor(sample[j+1]),
                snore_db3 : Math.floor(sample[j+2]),
                snore_db4 : Math.floor(sample[j+3]),
                snore_db5 : Math.floor(sample[j+4]),
                snore_db6 : Math.floor(sample[j+5]),
                snore_db7 : Math.floor(sample[j+6]),
                snore_db8 : Math.floor(sample[j+7]),
                snore_db9 : Math.floor(sample[j+8]),
                snore_db10 : Math.floor(sample[j+9]),
                check : c
            });
    
            const saveSnore_data=await snore.save();
            console.log(sample[j] + "    " + j);
            j += 10;
        }

        console.log("End");
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

        console.log("실행");
        let day = new Date(); // 현재 시간 구하는 함수
        //let cur_time = day.toLocaleString();
        let time1 = req.body.t1;
        var time2 = req.body.t2;
        var i = time1;
        var j = time1 + 420000;
        var cur = req.body.cur;
        var set = req.body.set;
        var s_day = req.body.day;

        for(i ; i<time2 ; i+=3000){
            console.log("실행" + i)

            if(i == time1 + 7200000){
                const rand = Math.floor(Math.random() * 3) + 1;

                if( 28 < set < 34){

                    const a = Math.floor(Math.random() * 10) + 1;

                    for(var b; b<rand;b++){

                        if(a < 6){
                            cur ++;
                        }
                        else{
                            cur--
                        }
                    }
                }
                else if(28>= set){
                    set++;
                }
                else if(32<= set){
                    set --;
                }
            }
            else if(i == time1 + 14400000){
                const rand = Math.floor(Math.random() * 3) + 1;

                if( 28 < set < 34){

                    const a = Math.floor(Math.random() * 10) + 1;

                    for(var b; b<rand;b++){

                        if(a < 6){
                            cur ++;
                        }
                        else{
                            cur--
                        }
                    }
                }
                else if(28>= set){
                    set++;
                }
                else if(32<= set){
                    set --;
                }
            }

            if(i == time1 + 60000){
                if(cur > set + 1){
                    cur--;
                }
                else{
                    cur ++;
                }
            }
            else if(i == time1 + 120000){
                if(cur > set + 1){
                    cur--;
                }
                else{
                    cur ++;
                }
            }
            else if(i == time1 + 180000){
                if(cur > set + 1){
                    cur--;
                }
                else{
                    cur ++;
                }
            }
            else if(i == time1 + 240000){
                if(cur > set + 1){
                    cur--;
                }
                else{
                    cur ++;
                }
            }
            else if(i == time1 + 300000){
                if(cur > set + 1){
                    cur--;
                }
                else{
                    cur ++;
                }
            }
            console.log("if문 실행");

            for(j ; j<time2; j += 60000){
                if(i == j){
                    if(cur > set + 1){
                        cur--;
                    }
                    else if(cur < set -2){
                        cur ++;
                    }
                    else{
                        const a = Math.floor(Math.random() * 10) + 1;
                        if(a==1 || a==2){
                            cur ++;
                        }
                        else if(a==3 || a==4){
                            cur--
                        }
                    }
                    
                }
                console.log(cur);
            }
            console.log("두번째 for문");

            var mat_time = i.toString();

            let mat = new Mat_data({
                mh_sn : "H10000000000",
                ble_connect : 1,
                current_temp : cur, /*default, max, unique ... */
                setting_temp : set,
                off_time : 0,
                on_time : 0,
                mode : 1,
                cover: 0,
                water_level: 1,
                pump: 1,
                heater: 1,
                error: 0,
                time : mat_time,
                s_day : s_day
                });
    
            const saveMat_data=await mat.save();
            console.log("저장");
        }

        console.log("End");
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