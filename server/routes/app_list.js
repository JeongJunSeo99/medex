const express = require("express");
const User = require("../models/user");
const Bed = require("../models/bed");
const Information = require("../models/information");
const Today = require("../models/today");
const Enviroment_data = require("../models/enviroment_data");
const Mat = require("../models/mat_data");
const Snore_data = require("../models/snore_data");
const File = require("../models/file");
const router = express.Router();          
//const bcrypt = require("bcryptjs");    
const mongoose = require("mongoose");
const schedule = require('node-schedule');

/*
1. 모델 폴더에 스키마 정의
2. 해당 스크립트에 정의한 스키마를 변수로 선언
3. 몽고DB model을 가져오기 위해 var 변수명 = mongoose.model('변수명', 정의한 스키마); 를 선언
4. 3번에서 정의한 변수명으로 쿼리문 사용
*/


router.post("/sign_up", async (req, res) => { //회원가입

    console.log(req.body);

    let timestamp = + new Date();

    let today = new Date();

    try { // id 비교
        usrid = req.body.userid
     
        let user = await User.findOne({ id: usrid });

        const re = {
            code: 400,
            msg: '유저 중복'
        };

        if (user) {
            console.log(user);
            return res.send(re);
        }
        /*
        const salt = await bcrypt.genSalt(10);
        usrpw = await bcrypt.hash(usrpw, salt);
        */
        user = new User({
        id : req.body.userid,
        password : req.body.userpw,
        phone_number : req.body.userph,
        gender : '0',
        birth: '0',
        height: '0',
        weight: '0',
        sleeptime: '0',
        wakeuptime: '0',
        sickness: '0',
        satisfaction: '0',
        serialnum : req.body.serialnum,
        name : req.body.name
        });

        const saveUser=await user.save();
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

router.post("/sign_in", async (req, res) => { //로그인

    User.findOne({ id: req.body.userid, password: req.body.userpw }, (err,user) => {
        if (err){
            const result123 = {
                code: 100,
                msg: 'server nodt'
            };
            res.send(result123);
            const result = {
                code: 500,
                msg: 'server error'
            };
            res.send(result);
        }
        else if(user){
            const r1 = {
                code: 200,
                msg: 'sucess',
                serialnum : user.serialnum,
                name : user.name
            };
            res.send(r1);
        }
        else{
            const re = {
                code: 400,
                msg: 'data null'
            };
            res.send(re);
        }
    });
    /*
    var Usr_model = mongoose.model('User', User); // 'User'는 데이터베이스 이름, User_model은 class 이름 -> 클래스 정의

    Usr_model.findOne({ id: req.body.id, password: req.body.password }, (err,user) => {
        if (err){
            const result = {
                code: 500,
                msg: 'server error'
            };
            res.send(result);
        }
        else if(user){
            const r1 = {
                code: 200,
                msg: 'sucess'
            };
            res.send(r1);
        }
        else{
            const re = {
                code: 400,
                msg: '유저 중복'
            };
            res.send(re);
        }
    });
    */
});

router.post("/information", async (req, res) => { //인포메이션 찾기
   
    console.log(req.body);
    Information.findOne({ serialnum: req.body.serial }, (err,info) => {
        if (err){
            const result123 = {
                code: 100,
                msg: 'server nodt'
            };
            res.send(result123);
            const result = {
                code: 500,
                msg: 'server error'
            };
            res.send(result);
        }
        else if(info){
            const r1 = {
                code: 200,
                msg: 'sucess',
                category : info.category,
                content : info.content
            };
            res.send(r1);
        }
        else{
            const re = {
                code: 400,
                msg: 'data null'
            };
            res.send(re);
        }
    });
    
});

router.post("/information/deep_sleep", async (req, res) => { //인포메이션 찾기
   

    Information.find({},(err,info) => {
        if (err){
            const result123 = {
                code: 100,
                msg: 'server nodt'
            };
            res.send(result123);
            const result = {
                code: 500,
                msg: 'server error'
            };
            res.send(result);
        }
        else if(info){
            /*
            const r1 = [{
                code: 200,
                msg: 'sucess',
                category : info.category,
                content : info.content
            }];
            */
            res.send(info);
        }
        else{
            const re = {
                code: 400,
                msg: 'data null'
            };
            res.send(re);
        }
    });
    
});

router.post("/information/recommend", async (req, res) => { //인포메이션 찾기
   
    var cat = "breathing"

    Information.find({ category: cat }, (err,info) => {
        if (err){
            const result123 = {
                code: 100,
                msg: 'server nodt'
            };
            res.send(result123);
            const result = {
                code: 500,
                msg: 'server error'
            };
            res.send(result);
        }
        else if(info){
            const r1 = [{
                code: 200,
                msg: 'sucess',
                category : info.category,
                content : info.content
            }];
            res.send(info);
        }
        else{
            const re = {
                code: 400,
                msg: 'data null'
            };
            res.send(re);
        }
    });
    
});

router.post("/survey", async (req, res) => { //설문조사
   
    console.log(req.body);

    try { // id 비교
        serial = req.body.serialnum

        //let user = await User.findOne({ serial });
       
        let user = await User.update({serialnum : serial }, {
        $set: {
            gender : req.body.gender,
            birth: req.body.birth,
            height: req.body.height,
            weight: req.body.weight,
            sleeptime: req.body.sleeptime,
            wakeuptime: req.body.wakeuptime,
            sickness: req.body.sickness,
            satisfaction:req.body.satisfaction
        }
        });

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

router.post("/change", async (req, res) => {
    
    console.log(req.body);
    
    try { // id 비교 
        serial = req.body.serialnum;
        user_name = req.body.name;
        phone_number = req.body.ph;

		if(user_name == ""){
            let user = await User.findOne({ serialnum : serial });  
            user_name = user.name;
        }
        else if(phone_number == ""){
            let user = await User.findOne({ serialnum : serial });  
            phone_number = user.phone_number
        }
        
        let user = await User.update({serialnum : serial }, {
        $set: {
            name : user_name,
            phone_number: phone_number
        }
        });

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

router.post("/pw_1", async (req, res) => { //비밀번호 찾기 (확인하는단계)
    User.findOne({ id: req.body.id, phone_number: req.body.ph }, (err,user) => {
        if (err){
            const result = {
                code: 500,
                msg: 'server error'
            };
            res.send(result);
        }
        else if(user){
            const r1 = {
                code: 200,
                msg: 'sucess'
            };
            res.send(r1);
        }
        else{
            const re = {
                code: 400,
                msg: 'data null'
            };
            res.send(re);
        }
    });
});

router.post("/pw_2", async (req, res) => { //비밀번호 찾기(비밀번호 수정하는 단계)
    try { // id 비교
       

        //let user = await User.findOne({ serial });
       
        let user = await User.update({id: req.body.id, phone_number: req.body.ph }, {
        $set: {
            password : req.body.pw
        }
        });

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

router.post("/sleep_check", async (req, res) => {
    try { // id 비교
        serial = req.body.serialnum

        let day = new Date(); // 현재 시간 구하는 함수
        //let cur_time = day.toLocaleString();
        let cur_time = day.getTime();
        let bed = await Bed.findOne({ serialnum: serial, msg: "sleep" }).sort({"_id":-1}).limit(1);
        if(bed){
            tmp = bed.sleep_seq + 1; //전 날 수면체크 + 1

            bed = new Bed({
                time : cur_time,
                msg : "sleep",
                sleep_seq: tmp,
                serial : serial
                });
    
            const saveBed=await bed.save();
            const r1 = {
                code: 200,
                msg: 'sucess'
            };
            res.send(r1);
            
        }
        else{
            let tmp = 1;

            bed = new Bed({
            time : cur_time,
            msg : "sleep",
            sleep_seq: tmp,
            serial : serial
            });
    
            const saveBed=await bed.save();
            const r1 = {
                code: 200,
                msg: 'sucess'
            };
            res.send(r1);
        }

        
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

router.post("/wake_up_check", async (req, res) => { //여기에서 하루치 수면 저장
    try { 
        //하루치 수면 데이터 저장 할 때, 데이터 값을 하나 추가해 DB에 저장해 다른 날들과 구별해서 저장
        serial = req.body.serialnum
        let day = new Date(); // 현재 시간 구하는 함수
        let tmp2 = day.getTime();
        let sleep = await Bed.findOne({ serialnum: serial, msg: "sleep" }).sort({"_id":-1}).limit(1);
        tmp1 = sleep.time;
        var en = await Enviroment_data.find({serial: serial, time: {$gt : tmp1, $lt : tmp2} });
        var snore = await Snore_data.find({serial: serial, time: {$gt : tmp1, $lt : tmp2} });
        var tem_avg = 0;
        var hum_avg = 0;
        var co2_avg = 0;
        var pose_count =0;
        var snore_count =0;
        var snore_min = [];
        var s_count = 0;
        var mat_s_day = [];
        var m_count = 0;

        var sleep_time = Math.trunc((tmp2 - tmp1) /1000 /60 /60);
        console.log(sleep_time);

        var mat_ch = await Mat.find({serial: serial});

        console.log(mat_ch);

        for(var i=0; i<mat_ch.length; i++){
            if(mat_ch[i].s_day>0){
                mat_s_day.push(mat_ch[i].s_day);
            }
        }
        console.log(mat_s_day);

        if(mat_s_day.length>0){
            for(var i=0; i<mat_s_day.length; i++){
                if(m_count < mat_s_day[i]){
                    m_count=mat_s_day[i];
                    
                }
            }
            console.log(m_count);
        }

        let mat_1 = await Mat.update({serial: serial, time: {$gt : tmp1, $lt : tmp2} }, {
            $set: {
                s_day : m_count + 1
            }
        });

        // tmp1 ~ tmp2 사이 값 쿼리
        for( i=0; i<en.length; i++){
            tem_avg += en[i].ev_temp;
            console.log(tem_avg);

            if(i==en.length-1){
                tem_avg = tem_avg/en.length;
                console.log(tem_avg);
            }
        }

        for( i=0; i<en.length; i++){
            hum_avg += en[i].ev_hum;
            console.log(tem_avg);

            if(i==en.length-1){
                hum_avg = hum_avg/en.length;
                console.log(um_avg);
            }
        }

        for( i=0; i<en.length; i++){
            co2_avg += en[i].ev_co2;
            console.log(tem_avg);

            if(i==en.length-1){
                co2_avg = co2_avg/en.length;
                console.log(co2_avg);
            }
        }

        for( i=0; i<snore.length; i++){
            // snore 저장 시 min 값 저장
            
            //수면 시작 후 1분 단위로 코골이 값 평균 저장
            var j = i

            if(i==0){
                if(snore[i].min != snore[i+1].min){
                    if(snore[i].check == "1"){
                        var s1 = 0;
                        var s2 = 0;
                        s1 =Math.max(snore[i].snore_db1, snore[i].snore_db2, snore[i].snore_db3, snore[i].snore_db4, snore[i].snore_db5, 
                            snore[i].snore_db6, snore[i].snore_db7, snore[i].snore_db8, snore[i].snore_db9, snore[i].snore_db10);
                        snore_min.push(s1);
                    }
                    else{
                        snore_min.push(0);
                    }
                }
            }

            while(j+1<snore.length && snore[j].min == snore[j+1].min){

                var s1 = 0;
                var s2 = 0;
                var s3 = 0;
                var s4 = 0;
                var s5 = 0;
                var s_f =0;
                var snore_sec = [];
                
                
                console.log("b");

                if(snore[j].check == "1"){
                    console.log("c");
                    s1 =Math.max(snore[j].snore_db1, snore[j].snore_db2, snore[j].snore_db3, snore[j].snore_db4, snore[j].snore_db5, 
                        snore[j].snore_db6, snore[j].snore_db7, snore[j].snore_db8, snore[j].snore_db9, snore[j].snore_db10);

                    snore_sec.push(s1);
                    console.log(snore_sec);
                    s_count++;
                }

                
                if(j+2==snore.length){
                    /*
                    if(snore[j+1].check =="1"){
                        s4 = Math.max(snore[j+1].snore_db1, snore[j+1].snore_db2, snore[j+1].snore_db3, snore[j+1].snore_db4, snore[j+1].snore_db5, 
                            snore[j+1].snore_db6, snore[j+1].snore_db7, snore[j+1].snore_db8, snore[j+1].snore_db9, snore[j+1].snore_db10);

                        snore_sec.push(s4);
                        console.log(snore_sec);
                        s_count++;
                    }
                    */
                    if(s_count == 0){
                        s3 = 0 ;
                    }
                    else{
                        for(a=0;a<snore_sec.length;a++){
                            if(s3 < snore_sec[a]){
                                s3 = snore_sec[a];
                            }
                        }
                    }
                    snore_min.push(s3);
                    s_count = 0;
                    console.log("코골이 : " + snore_min);
                }
                else if(snore[j].min != snore[j+2].min){
                    if(s_count == 0){
                        s3 = 0 ;
                    }
                    else{
                        for(a=0;a<snore_sec.length;a++){
                            if(s3<snore_sec[a]){
                                s3 = snore_sec[a];
                            }
                        }    
                    }
                    snore_min.push(s3);
                    s_count = 0;
                    console.log("코골이 : " + snore_min);
                }

                console.log("e");
                j++;
            }     

            
            /*

            ---------------------------------------------------------------------------
            if(snore[i].코골이 존재 == true){
                if(i!=0){
                    if(snore[i-1].코골이 존재 == false){
                        var a[].append() = snore[i-1].time
                    }
                }

                코골이 존재하는 시간 + 분값을 전부 받음
                코골이 true인 데이터 개수 * 5초 = 전체 코골이 시간
                코골이 true인 데이터 시간
                
            }

            if(snore[i].코골이 존재 == false){
                if(i!=0){
                    if(snore[i-1].코골이 존재 == true){
                        var b[].append() = snore[i-1].time
                    }
                }
                //만약 일어나기 직전까지 코를 곤다면 a[], b[] 원소의 개수가 달라지므로, 예외처리해야함
                // a[].length != b[].length 이라면 b[] 마지막 원소에 일어나기 직전 시간 추가
                


                코골이 존재하는 시간 + 분값을 전부 받음
                코골이 true인 데이터 개수 * 5초 = 전체 코골이 시간
                코골이 true인 데이터 시간
                
            }
            */
        }

        let bed_wake = await Bed.findOne({ serialnum: serial, msg: "wake" }).sort({"_id":-1}).limit(1);

        if(bed_wake){
            var tmp = bed_wake.wake_seq + 1; //전 날 수면체크 + 1

            bed_wake = new Bed({
                time : tmp2,
                msg : "wake",
                wake_seq: tmp,
                serial : serial
            });

            const saveBed=await bed_wake.save();
        }
        else{
            let tmp = 1;

            bed_wake = new Bed({
                time : tmp2,
                msg : "wake",
                wake_seq: tmp,
                serial : serial
            });

            const saveBed=await bed_wake.save();
        }

        let today = await Today.findOne({ serial: serial }).sort({"_id":-1}).limit(1);

        if(today){
            let tmp = today.seq + 1; //전 날 수면체크 + 1

            today = new Today({
                serial: serial,
                temp: tem_avg,
                co2: co2_avg,
                hum: hum_avg,
                sleep_time: sleep_time,
                snore: snore_min,
                seq: tmp
            });
    
            const saveToday=await today.save();
            const r1 = {
                code: 200,
                msg: 'sucess'
            };
            res.send(r1);
            
        }
        else{
            let tmp = 1;

            today = new Today({
                serial: serial,
                temp: tem_avg,
                co2: co2_avg,
                hum: hum_avg,
                sleep_time: sleep_time,
                snore: snore_min,
                seq: tmp
            });
    
            const saveToday=await today.save();
            const r1 = {
                code: 200,
                msg: 'sucess'
            };
            res.send(r1);
        }
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

router.post("/today_sleep", async (req, res) => { 
    try { 
        let today = await Today.findOne({ serial: req.body.serialnum }).sort({"_id":-1}).limit(1);

        console.log(today);

        const r1 = {
            code: 200,
            msg: 'sucess',
            temp: today.temp,
            co2: today.co2,
            hum: today.hum,
            sleep_time: today.sleep_time,
            snore: today.snore
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