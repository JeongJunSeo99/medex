const express = require("express");
const User = require("../models/user");
const Mat = require("../models/mat_data");
const File = require("../models/file");
const router = express.Router();          
//const bcrypt = require("bcryptjs");    
const mongoose = require("mongoose");
const multer = require("multer");
const schedule = require('node-schedule');
const { PythonShell }= require("python-shell");
var fs = require("fs");
const { Parser } = require('json2csv');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: './csv/file' + Date.now() + '.csv',
    header: [
      {id: 'mh_sn', title: 'Mh_sn'},
      {id: 'current_temp', title: 'Current_temp'},
      {id: 'setting_temp', title: 'Setting_temp'},
      {id: 'time', title: 'Time'},
      {id: 's_day', title: 'S_day'},
    ]
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads') // 파일 업로드 경로
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()) //파일 이름 설정
    }
})

const upload = multer({storage: storage});

router.post('/file_up', upload.array('file'), async (req, res) => { //현준이랑 file 송수신 테스트
    try{
            console.log(req.files[0]);
            console.log("destinatin에 저장된 파일 명 : ", req.files[0].filename);
            console.log("업로드된 파일의 전체 경로 ", req.files[0].path);
            console.log("사용자가 업로드한 파일 명 : ", req.files[0].originalname);
            
            var serial = req.files[0].originalname.split('.')
            console.log(req.files[0]);
            console.log(serial[0]);

            let file = await File.findOne({ origin_name: req.files[0].originalname});
    
            if(file){
                if(fs.existsSync("./uploads/" + file.dest_name)){
                    fs.unlinkSync("./uploads/" + file.dest_name);
                    console.log("기존 파일 삭제");
                }

                let file_1 = await File.update({origin_name: req.files[0].originalname }, {
                    $set: {
                        origin_name : req.files[0].originalname,
                        dest_name: req.files[0].filename,
                        path : req.files[0].path,
                        serial : serial[0]
                    }
                });
            }
            else{
                file = await new File({
                    origin_name : req.files[0].originalname,
                    dest_name: req.files[0].filename,
                    path : req.files[0].path,
                    serial : serial[0]
                });
    
                const saveFile= await file.save();
            }
   
        //파일 메타데이터 오리지널 네임 + 데스티네이션 네임 + 경로를 DB에 저장해 맵핑
        
        console.log(req.body);
        console.log(req.files);
        res.send("destinatin에 저장된 파일 명 : " + req.files[0].filename + "\n" + "업로드된 파일의 전체 경로 : " + req.files[0].path
        + "\n" + "사용자가 업로드한 파일 명 : " +req.files[0].originalname+ + "\n" + "기존 파일 삭제 후 파일 업로드 및 DB 수정 완료");
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

router.post("/mdx", async (req, res) => {
    
    try {
    
        let options = {
            args: "/home/hadoop/Desktop/medex/server/mdx_data.csv"
        };
        var rec = [];
        var rec_s = [];

        PythonShell.run("./logistic_regression.py", options, function(err, data) {
            if (err) throw err;
            console.log(data.length);
            let a,b,c,d,e;
            console.log(data[0]);
            console.log(data[0].length);
            if(data[0].length == 3){
                a = data[0].substr(1, 1);
                rec.push(a);
            }
            else if(data[0].length == 6){
                a = data[0].substr(1, 1);
                b = data[0].substr(4, 1);
                rec.push(a);
                rec.push(b);
            }
            else if(data[0].length == 9){
                a = data[0].substr(1, 1);
                b = data[0].substr(4, 1);
                c = data[0].substr(7, 1);
                rec.push(a);
                rec.push(b);
                rec.push(c);
            }
            else if(data[0].length == 12){
                a = data[0].substr(1, 1);
                b = data[0].substr(4, 1);
                c = data[0].substr(7, 1);
                d = data[0].substr(10, 1);
                rec.push(a);
                rec.push(b);
                rec.push(c);
                rec.push(d);

            }
            else if(data[0].length == 15){
                a = data[0].substr(1, 1);
                b = data[0].substr(4, 1);
                c = data[0].substr(7, 1);
                d = data[0].substr(10, 1);
                e = data[0].substr(13, 1);
                rec.push(a);
                rec.push(b);
                rec.push(c);
                rec.push(d);
                rec.push(e);
            
            }

            

            for(var i = 0; i<rec.length; i++){
                if(rec[i]==0){
                    rec_s.push("코골이");
                }
                else if(rec[i] == 1){
                    rec_s.push("뒤척임");
                }
                else if(rec[i] == 2){
                    rec_s.push("소음");
                }
                else if(rec[i] == 3){
                    rec_s.push("bmi");
                }
                else if(rec[i] == 4){
                    rec_s.push("수면시간");
                }
                else if(rec[i] == -1){
                    rec_s.push("추천정보 없음");
                }
            }
            console.log(rec);
            console.log(rec_s);
            
        });

        setTimeout( async function() {
            let user = await User.update({serialnum : "H10000000000" }, {
                $set: {
                    rec : rec_s
                }
            });
            console.log("save");
          }, 5000);

        

        //snoring,snoringS,moving,sound,bmi,stime
        res.send("ok");
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

router.get("/serial_res", async (req, res) => {// 초기 학습 시 시리얼 정보 전송
    // 모든 유저 학습 시킬 거임
    try {
        /*
        let user = await User.find({},{"_id":false, "serialnum":true});

        for(var i=0; i<user.length; i++) {
            var serial = user[i].serialnum;
>*/
            let options = {
                args: "4stup"
            };
            

            PythonShell.run("./0920_learn.py", options, function(err, data) {
                if (err) throw err;
                console.log(data);
            });
        
        
        res.send("ok");
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

router.get("/serial_model_res", async (req, res) => {// 추가 학습 시 시리얼과 모델 경로 전달
    
    try {
        let user = await User.find({},{"_id":false, "serialnum":true});
        let file = await File.findOne({ serial: "1234"});
        var serial = user[0].serialnum;
        var path = ".\\" + file.path;

        let options = {
            args: [1234, path]
        };

        res.send(serial + " " + path);

        PythonShell.run("./0920_learn_add.py", options, function(err, data) {
            if (err) throw err;
            console.log(data);
            console.log(data[data.length - 1]);
        });
/*
        for(var i=0; i<user.length; i++) {

            //let file = await File.findOne({ serial: user[i].serialnum});
            let file = await File.findOne({ serial: "1234"}).sort({"_id":-1}).limit(1);
            console.log(file);

            //path = "./" + file.path

            var serial = user[i].serialnum;

            let options = {
                args: serial, path
            };

            res.send("ok");
            */
/* 시리얼 전달해주려는 파이쉘 사용
            PythonShell.run("./", options, function(err, data) {
                if (err) throw err;
                console.log(data);
            });
        
        }
        */
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

router.post("/learn", async (req, res) => { //초기 학습을 위한 데이터 전송 (모든 온도 데이터 전송)
    // 이벤트 1 -> 초기학습. 이 때는 시리얼 넘버만 전송
    // 이벤트 2 -> 확인해서 추가학습(모델 존재)이면 시리얼 넘버 및 모델 경로 전송
    try {
        // 맞춤형 온도 서비스 모델에 사용
        console.log(req.body.serialnum);
        serial = req.body.serialnum;

        var mat_1 = await Mat.find({mh_sn: serial, s_day : { $gt: 0 } }, 
        {"_id":false, "mh_sn":true, "current_temp" : true, "setting_temp" : true, "time":true, "s_day":true});
        
        const mat_json = JSON.parse(JSON.stringify(mat_1));

        res.send(mat_1);

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

router.post("/learn_add", async (req, res) => { //추가 학습을 위한 데이터 전송 (가장 최근 날짜(s_day가 가장 큰거) 온도 데이터 전송)
    
    try {
        // 맞춤형 온도 서비스 모델에 사용
        serial = req.body.serialnum;
        var max;

        var mat_max = await Mat.find({mh_sn: serial, s_day : { $gt: 0 } }, 
        {"_id":false, "s_day":true});

        for (var i = 0; i < mat_max.length; i++){
            var max = mat_max[i].s_day;
            if (i>0 && max < mat_max[i].s_day){
                max = mat_max[i].s_day;
            }
        }
        
        var mat_1 = await Mat.find({mh_sn: serial, s_day :9 /*{ $gte: max }*/ }, 
        {"_id":false, "mh_sn":true, "current_temp" : true, "setting_temp" : true, "time":true, "s_day":true});
        
        console.log(mat_1);
        res.send(mat_1);
        //const mat_json = JSON.parse(JSON.stringify(mat_1));

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

router.post("/rec", async (req, res) => { //온도 추천을 위한 데이터 전송 (가장 최근 데이터 limit 20개만 전송)
    
    try {
        // 맞춤형 온도 서비스 모델에 사용
        serial = req.body.serialnum;

        var mat_1 = await Mat.find({mh_sn: serial, s_day : 3/*{ $gt: 0 }*/ }, //마지막 수면을 가져오게 해야 함
        {"_id":false, "mh_sn":true, "current_temp" : true, "setting_temp" : true, "time":true, "s_day":true}).sort({"_id":1}).limit(4180);
        
        const mat_json = JSON.parse(JSON.stringify(mat_1));
        console.log(mat_1);

        res.send(mat_1);
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



router.post("/python", async (req, res) => {
    
    try {
        var mat_1 = await Mat.find({mh_sn: req.body.serialnum, s_day : { $gt: 0 } }, 
        {"_id":false, "mh_sn":true, "current_temp" : true, "setting_temp" : true, "time":true, "s_day":true});
        
        let options = {
            args: mat_1
        };
        
        PythonShell.run("./test.py", options, function(err, data) {
            if (err) throw err;
            console.log(data);
        });
        res.send("ok");
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

router.post("/py", async (req, res) => {
    
    try {
        
        let options = {
            args: "./csv/file1663069153381.csv"
        };
        
        PythonShell.run("./test.py", options, function(err, data) {
            if (err) throw err;
            console.log(data);
        });
        res.send("ok");
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