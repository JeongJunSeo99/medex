var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
//var api = require('./routes/index');
var Motion_bed=require("./models/motion_bed");
var Enviroment_data=require("./models/enviroment_data");
var Pose_data=require("./models/pose_data");
const Today = require("./models/today");
var Snore_data=require("./models/snore_data");
var Bed_data=require("./models/bed_data");
var Mat_data=require("./models/mat_data");
var Ack_data=require("./models/ack_data");
var S_ch=require("./models/s_ch");
var Control=require("./models/control");
const Information = require("./models/information");
var mqtt=require('mqtt');
var moment = require('moment');
var client =mqtt.connect('mqtt://220.149.244.206:1883');
var MH_sn;
const { PythonShell }= require("python-shell");
const schedule = require('node-schedule');

// conncet to mqtt broker server and subscribe mqtt topic(topic_list) 
const topic_list=['connect','env_data/+',
'pose_data/+','snore_data/+', 'bed_data/+', 
'mat_data/+', 'ack/+','command/+'];

client.on('connect',()=>{
    client.subscribe(topic_list);
    console.log('connected mqtt broker server');
    
});
 
client.on('message', async (topic,message)=>{
    /*
    let day = new Date(); // 현재 시간 구하는 함수   
    let cur_time = day.getTime();
    var data=JSON.parse(message);
    MH_sn = data.mh_sn;
    var s_options = {
            qos:1
    };
    var server_time = 'command/' + MH_sn;
    s_t= {
            "command_type" :2,
            "time" : cur_time,
    };
    client.publish(server_time,JSON.stringify(s_t),s_options);
*/
    if(topic==='connect'){
        var data=JSON.parse(message);
        console.log(data);
        MH_sn = data.mh_sn;
        let day = new Date(); 
        let cur_time = day.getTime();

        let motion_bed = Motion_bed({
            mh_sn : data.mh_sn,
            time : cur_time
        });

        var connect_control = 'command/' + MH_sn;

        server_time = {
            "command_type" : "2",
            "time" : cur_time
        };
        client.publish(connect_control, JSON.stringify(server_time));

        try{
            const saveMotion_bed=await motion_bed.save();
            console.log("insert OK");
            console.log(MH_sn);
            }
            catch(err){
            console.log({message:err});
            }
    }
    
    var env_t= 'env_data/' + MH_sn;    

    if(topic===env_t){
        var env_data= JSON.parse(message);
        console.log(env_data);
        let day = new Date(); 
        let cur_time = day.getTime();

        let e_d = Enviroment_data({
                mh_sn : env_data.mh_sn,
                ev_temp : env_data.ev_temp,
                ev_hum : env_data.ev_hum,
                ev_co2 : env_data.ev_co2,
                in_snore : env_data.in_snore,
                time : cur_time
                
            });

        try{
            const saveEnviroment_data=await e_d.save();
            //console.log("Enviroment data insert OK");
            }
            catch(err){
            console.log({message:err});
            }
    }

    var pose_t= 'pose_data/' + MH_sn;

    if(topic===pose_t){
        var pose_data= JSON.parse(message);
        console.log(pose_data);
        let day = new Date(); 
        let cur_time = day.getTime();

        let p_d = Pose_data({
            mh_sn : pose_data.mh_sn,
            pitch_angle : pose_data.pitch_angle,
            roll_angle : pose_data.roll_angle,
            pose_type : pose_data.pose_type,
            time : cur_time
        });

        try{
            const savePose_data=await p_d.save();
            //console.log("Pose data insert OK");
            //console.log(env_t);
            }
            catch(err){
            console.log({message:err});
            }
    }

    var snore_t= 'snore_data/' + MH_sn;

    if(topic===snore_t){
        var snore_data= JSON.parse(message);
        console.log(snore_data);

        let check = await S_ch.findOne({ serial: snore_data.mh_sn }).sort({"_id":-1}).limit(1);

        let day = new Date(); // 현재 시간 구하는 함수
        let cur_time = day.getTime();
        let min = day.getMinutes();
        let hour = day.getHours();

        if(snore_data.out_snore==1){
            bed_c = {
                "function_mode" : 1,
                "command_type" :4,
                "mh_sn" : MH_sn,
                "head_count" : 1,
                //"count" : 100
                "foot_count" : 0
            };

            let s_ch = S_ch({
                serial : snore_data.mh_sn,
                time : cur_time
            });

            var options = {
                qos:1
            };

            var bed_control = 'command/' + MH_sn;

            if(parseInt(check.time) + 60000 < cur_time){
                client.publish(bed_control,JSON.stringify(bed_c),options);
            }
            
        }
        else{
            bed_c = {
                "function_mode" : 1,
                "command_type" :4,
                "mh_sn" : MH_sn,
                //"head_count" : down,
                //"count" : 100
                "foot_count" : 0
            };

            let s_ch = S_ch({
                serial : snore_data.mh_sn,
                time : cur_time
            });

            var options = {
                qos:1
            };
            var bed_control = 'command/' + MH_sn;

            if(parseInt(check.time) < cur_time){
                client.publish(bed_control,JSON.stringify(bed_c),options);
            }
        }

        let s_d = Snore_data({
            serial : snore_data.mh_sn,
            min : min,
            hour : hour,
            time : cur_time,
            snore_db1 : snore_data.snore_db1,
            snore_db2 : snore_data.snore_db2,
            snore_db3 : snore_data.snore_db3,
            snore_db4 : snore_data.snore_db4,
            snore_db5 : snore_data.snore_db5,
            snore_db6 : snore_data.snore_db6,
            snore_db7 : snore_data.snore_db7,
            snore_db8 : snore_data.snore_db8,
            snore_db9 : snore_data.snore_db9,
            snore_db10 : snore_data.snore_db10,
            check : snore_data.out_snore
        });

        try{
            const saveSnore_data=await s_d.save();
            const saveS_ch=await s_ch.save();
            //console.log("Snore data insert OK");
            }
        catch(err){
            console.log({message:err});
            }
    }

    var bed_t= 'bed_data/' + MH_sn;

    if(topic===bed_t){
        
        var bed_data= JSON.parse(message);
        
        console.log(bed_data);
        
        let day = new Date(); 
        let cur_time = day.getTime();
        let b_d = Bed_data({
            mh_sn : bed_data.mh_sn,
            head_count : bed_data.head_count,
            foot_count : bed_data.foot_count,
            time : cur_time,
            bed_status : bed_data.bed_status
        });

        try{
            const saveBed_data=await b_d.save();
            //console.log("Bed data insert OK");
            //console.log(pose_t);
            }
            catch(err){
            console.log({message:err});
            }
    }

    var mat_t= 'mat_data/' + MH_sn;

    if(topic===mat_t){
        var mat_data= JSON.parse(message);
        console.log(mat_data);
        let day = new Date(); 
        let cur_time = day.getTime();
        let m_d = Mat_data({
            mh_sn : mat_data.mh_sn,
            ble_connect : mat_data.ble_connect,
            current_temp : mat_data.current_temp,
            setting_temp : mat_data.setting_temp,
            off_time : mat_data.off_time,
            on_time : mat_data.on_time,
            mode : mat_data.mode,
            cover : mat_data.cover,
            water_level : mat_data.water_level,
            pump : mat_data.pump,
            heater : mat_data.heater,
            error : mat_data.error,
            time : cur_time,

        });

        try{
            const saveMat_data=await m_d.save();
            //console.log("Mat data insert OK");
            }
            catch(err){
            console.log({message:err});
            }
    }

    var ack_t= 'ack/' + MH_sn;

    if(topic===ack_t){
        var A= JSON.parse(message);

        let a_d = Ack_data({
            command_type : A.command_type,
            error_type : A.error_type,
            cmd_no : A.cmd_no        
        });

        try{
            const saveAck_data=await a_d.save();
            //console.log("Ack insert OK");
            }
            catch(err){
            console.log({message:err});
            }
    }
    var c_t= 'command/' + MH_sn;

    if(topic ===c_t ){
        var a = JSON.parse(message);
        console.log(a);
    }

    /*
    buf_e={
        "command_type" : "1"
    }
    moment.tz.setDefault("Asia/Seoul"); 
    var date = moment().format('YYYY-MM-DD HH:mm:ss');

    buf_f={
        "command_type" : "2",
        "time" : date
    }

    var co_t= 'command/' + MH_sn;
    var co__co_t= 'command/' + MH_sn + 'common';


    client.on('connect',function(){
        client.subscribe(co_t);
        client.publish(co_t,JSON.stringify(buf_e));
        });
    client.on('connect',function(){
        client.subscribe(co_co_t);
        client.publish(co_co_t,JSON.stringify(buf_e));
        });
        */
});

//conncet to mongodb server
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
console.log('connected mongodb server!');
});
mongoose.connect('mongodb://localhost/Medex');
const port = 3001;

//bodyParser setting
app.use(bodyParser.urlencoded({
extended: true
}));
app.use(bodyParser.json());
//app.use(express.json({extended : false}));
//app.use(express.urlencoded({extended:true}));
//app.use('/api', api);
app.use("/app_list", require("./routes/app_list"));
app.use("/test", require("./routes/test"));
app.use("/algo", require("./routes/algo"));
app.listen(port, () => {
console.log('Express is listening on port', port);
});

let options = {
    args: "/home/hadoop/Desktop/Medex/server/mdx_data.csv"
};

app.get("/mdx", async (req, res) => {
    
    try {
        PythonShell.run("./logistic_regression.py", options, function(err, data) {
            if (err) throw err;
            console.log(data);
        });
        /*
        let p_options = {
            scriptPath: '/home/hadoop/Desktop/Medex/server',
            args: ['value1', 'value2']/home/hadoop/Desktop/Medex/server
          };
        
        let pyshell = new PythonShell('logistic_regression.py', p_options);

        //pyshell.send('/home/hadoop/Desktop/Medex/server/mdx_data.csv');
        pyshell.send('./mdx_data.csv')

        pyshell.on('msg', (msg) => {
	        console.log(msg)
            
        })
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

/*
PythonShell.run("./test.py", options, function(err, data) {
    if (err) throw err;
    console.log(data);
  });
*/

/*
Enviroment_data.find(function(err, a){
    if(err){
        console.log(err);
    }
    else{
        console.log(a);
        /*
        //console.log(a);
        let options = {
            args: [a]
        };
        PythonShell.run("./test.py", options, function(err, data) {
            if (err) throw err;
            console.log(data);
        });
        
    }
});
*/

app.post("/angle", async (req, res) => {

    console.log(req.body);

    try {
       
        sid = req.body.serialnum
        let today = new Date();
        let cur_time = today.toLocaleString();
      /*
        let today = new Date();
        let cur_time = today.toLocaleString();
        let control = await control.findOne({ serialnum: sid }); // control table 필요
        let timestamp = + new Date();
        control = new Control({
            command_type : "4",
            mh_sn : sid,
            head_count : req.body.head_count,
            foot_count : req.body.foot_count,
            time : timestamp,
            function_mode : "?" //function mode 처리 부분이 어디인지
        });

        const saveControl=await control.save();
        const r1 = {
            code: 200,
            msg: 'sucess'
        };
        res.send(r1);
*/
        var options = {
            qos:1
        };
        var bed_control = 'command/' + sid;

        var bed_control1 = '/command/' + sid;
        var a = 4;
        var b = 1000;
        var c = 0;
        var d = 1;
        
        var msg = req.body.btnnum;
        //console.log(msg)
        
        var head_count= 0;
        var leg_count=0;
        
        if(msg== "headup" ){
            bed_c = {
                "function_mode" : 1,
                "command_type" :4,
                "mh_sn" : sid,
                "head_count" : 3,
                //"count" : 100
                "foot_count" : 0
            };
            /*
            let control = await Control.findOne({ serial: sid }).sort({"_id":-1}).limit(1);
            if(control){
                head_count = control.head_count + 5;
                leg_count = control.leg_count;
                control = new Control({
                    time: cur_time,
                    head_count: head_count,
                    leg_count: leg_count,
                    serial : sid
                });
                const saveControl=await control.save();
            }
            else{
                head_count = 5;
                leg_count = 0;
                control = new Control({
                    time: cur_time,
                    head_count: head_count,
                    leg_count: leg_count,
                    serial : sid
                });
                const saveControl=await control.save();
            }
            */
        }
        else if(msg == "headdown"){
            bed_c = {
                "function_mode" : 1,
                "command_type" :4,
                "mh_sn" : sid,
                "head_count" : -3,
                //"count" : 100
                "foot_count" : 0
            };
            
        
        }
        else if(msg == "legup"){
            bed_c = {
                "function_mode" : 1,
                "command_type" :4,
                "mh_sn" : sid,
                "head_count" : 0,
                //"count" : 100
                "foot_count" : 3
            };
            
        }
        else if(msg == "legdown"){
            bed_c = {
                "function_mode" : 1,
                "command_type" :4,
                "mh_sn" : sid,
                "head_count" : 0,
                //"count" : 100
                "foot_count" : -3
            };
        }
        else if(msg == "flat"){
            bed_c = {
                "function_mode" : 2,
                "command_type" :4,
                "mh_sn" : sid,
                "head_count" : 0,
                //"count" : 100
                "foot_count" : 0
            };
        }
        else if(msg == "zg"){
            bed_c = {
                "function_mode" : 4,
                "command_type" :4,
                "mh_sn" : sid,
                "head_count" : 0,
                //"count" : 100
                "foot_count" : 0
            };
        }
/*
        bed_c = {
            "function_mode" : d,
            "command_type" :a,
            "mh_sn" : sid,
            "head_count" : head_count,
            //"count" : 100
            "foot_count" : leg_count
        };
*/

        
        
        console.log(bed_c)
        
        //client.publish(bed_control,JSON.stringify(bed_c));
        client.publish(bed_control,JSON.stringify(bed_c),options);
        //client.publish('common/H10000000000',JSON.stringify(bed_c),options);
        //client.publish('common',JSON.stringify(bed_c),options);

        const result = {
            code: 200,
            msg: 'sucess'
        };
        //client.publish(bed_control1, JSON.stringify(bed_c));
        res.send(result);
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

app.post("/info", async (req, res) => { 

    console.log(req.body);

    try { 
        information = new Information({
        category: req.body.cate,
        content : req.body.con,
       
        });

        const saveInformation=await information.save();
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

app.post("/mat_control", async (req, res) => {

    console.log(req.body);

    try {
        
        sid = req.body.serialnum

        var options = {
            qos:1
        };
        var bed_control = 'command/' + sid;
        var msg = req.body.btnnum;

        if(msg== "tempup" ){
            let mat = await Mat_data.findOne({ mh_sn: sid }).sort({"_id":-1}).limit(1);
            mat_c = {
                "command_type" :5,
                "mh_sn" : sid,
                "mat_command" : 4
            };
            const result = {
                code: 200,
                msg: 'sucess',
                temp : mat.current_temp 
            };
            res.send(result);
        }
        else if(msg == "tempdown"){
            let mat = await Mat_data.findOne({ mh_sn: sid }).sort({"_id":-1}).limit(1);
            mat_c = {
                "command_type" :5,
                "mh_sn" : sid,
                "mat_command" : 3
            };
            const result = {
                code: 200,
                msg: 'sucess',
                temp : mat.current_temp 
            };
            res.send(result);
        }
        else if(msg == "power"){
            let mat = await Mat_data.findOne({ mh_sn: sid }).sort({"_id":-1}).limit(1);
            mat_c = {
                "command_type" :5,
                "mh_sn" : sid,
                "mat_command" : 1
            };
            const result = {
                code: 200,
                msg: 'sucess',
                temp : mat.current_temp 
            };
            res.send(result);
        }
        else if(msg == "now"){
            let mat = await Mat_data.findOne({ mh_sn: sid }).sort({"_id":-1}).limit(1);
            console.log(mat);
            const result_now = {
                code: 200,
                msg: 'sucess',
                temp : mat.current_temp 
            };
            res.send(result_now);
        }
       
        console.log(mat_c)
        
        client.publish(bed_control,JSON.stringify(mat_c),options);

        
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


/*
const j1 = schedule.scheduleJob('0 0 0 * * *', async function(){
    try {
        console.log("0시 실행");

        serial = "H10000000000";

        let day = new Date(); // 현재 시간 구하는 함수
        //let cur_time = day.toLocaleString();
        let cur_time = day.getTime();
        let bed = await Bed.findOne({ serial: serial, msg: "sleep" }).sort({"_id":-1}).limit(1);
        if(bed){
            tmp = bed.sleep_seq + 1; //전 날 수면체크 + 1

            bed = new Bed({
                time : cur_time,
                msg : "sleep",
                sleep_seq: tmp,
                serial : "H10000000000"
                });
    
            const saveBed=await bed.save();
        }
        else{
            let tmp = 1;

            bed = new Bed({
            time : cur_time,
            msg : "sleep",
            sleep_seq: tmp,
            serial : "H10000000000"
            });
    
            const saveBed=await bed.save();
            const r1 = {
                code: 200,
                msg: 'sucess'
            };
            
        }
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };

    }

});

const j2 = schedule.scheduleJob('0 0 2 * * *', async function(){
    try {
        console.log("2시 실행");

        serial = "H10000000000";
        const rand = Math.floor(Math.random() * 4) + 1;
        let mat = await Mat_data.findOne({ mh_sn: serial}).sort({"_id":-1}).limit(1);
            if( 28 < mat.current_temp < 34){
                
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : rand
                };
            }
            else if(28>=mat.current_temp){
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : 4
                };
            }
            else if(32<=mat.current_temp){
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : 3
                };
            }
            var options = {
                qos:1
            };

            var bed_control = 'command/' + serial;

            client.publish(bed_control,JSON.stringify(mat_c),options);
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };
   
    }

});

const j3 = schedule.scheduleJob('0 0 4 * * *', async function(){
    try {
        console.log("4시 실행");

        serial = "H10000000000";
        const rand = Math.floor(Math.random() * 4) + 1;
        let mat = await Mat_data.findOne({ mh_sn: serial }).sort({"_id":-1}).limit(1);
            if( 28 < mat.current_temp < 34){
                
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : rand
                };
            }
            else if(28>=mat.current_temp){
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : 4
                };
            }
            else if(32<=mat.current_temp){
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : 3
                };
            }

            var options = {
                qos:1
            };
            
            var bed_control = 'command/' + serial;

            client.publish(bed_control,JSON.stringify(mat_c),options);
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };
   
    }

});
            
const j4 = schedule.scheduleJob('0 0 6 * * *', async function(){
    try {
        console.log("6시 실행");

        serial = "H10000000000"
        let day = new Date(); // 현재 시간 구하는 함수
        let tmp2 = day.getTime();
        let sleep = await Bed.findOne({ serial: serial, msg: "sleep" }).sort({"_id":-1}).limit(1);
        tmp1 = sleep.time;
        var en = await Enviroment_data.find({mh_sn: serial, time: {$gt : tmp1, $lt : tmp2} });
        var snore = await Snore_data.find({mh_sn: serial, time: {$gt : tmp1, $lt : tmp2} });
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

        var mat_ch = await Mat_data.find({mh_sn: serial});

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

        let mat_1 = await Mat_data.update({mh_sn: serial, time: {$gt : tmp1, $lt : tmp2} }, {
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
        }

        let bed_wake = await Bed.findOne({ serial: serial, msg: "wake" }).sort({"_id":-1}).limit(1);

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

        }
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };
        
    }

});

//////////////////////////////////////////////

const j5 = schedule.scheduleJob('0 0 8 * * *', async function(){
    try {
        console.log("8시 실행");

        serial = "H10000000000"
        let day = new Date(); // 현재 시간 구하는 함수
        //let cur_time = day.toLocaleString();
        let cur_time = day.getTime();
        let bed = await Bed.findOne({ serial: serial, msg: "sleep" }).sort({"_id":-1}).limit(1);
        if(bed){
            tmp = bed.sleep_seq + 1; //전 날 수면체크 + 1

            bed = new Bed({
                time : cur_time,
                msg : "sleep",
                sleep_seq: tmp,
                serial : "H10000000000"
                });
    
            const saveBed=await bed.save();
        }
        else{
            let tmp = 1;

            bed = new Bed({
            time : cur_time,
            msg : "sleep",
            sleep_seq: tmp,
            serial : "H10000000000"
            });
    
            const saveBed=await bed.save();
            const r1 = {
                code: 200,
                msg: 'sucess'
            };

        }
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };

    }

});

const j6 = schedule.scheduleJob('0 0 10 * * *', async function(){
    try {
        console.log("10시 실행");

        serial = "H10000000000"
        const rand = Math.floor(Math.random() * 4) + 1;
        let mat = await Mat_data.findOne({ mh_sn: serial }).sort({"_id":-1}).limit(1);
            if( 28 < mat.current_temp < 34){
                
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : rand
                };
            }
            else if(28>=mat.current_temp){
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : 4
                };
            }
            else if(32<=mat.current_temp){
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : 3
                };
            }

            var options = {
                qos:1
            };
            
            var bed_control = 'command/' + serial;

            client.publish(bed_control,JSON.stringify(mat_c),options);
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };

    }

});

const j7 = schedule.scheduleJob('0 0 12 * * *', async function(){
    try {
        console.log("12시 실행");

        serial = "H10000000000"
        const rand = Math.floor(Math.random() * 4) + 1;
        let mat = await Mat_data.findOne({ mh_sn: serial }).sort({"_id":-1}).limit(1);
            if( 28 < mat.current_temp < 34){
                
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : rand
                };
            }
            else if(28>=mat.current_temp){
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : 4
                };
            }
            else if(32<=mat.current_temp){
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : 3
                };
            }

            var options = {
                qos:1
            };
            
            var bed_control = 'command/' + serial;

            client.publish(bed_control,JSON.stringify(mat_c),options);
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };

    }

});
            
const j8 = schedule.scheduleJob('0 0 14 * * *', async function(){
    try {
        console.log("14시 실행");

        serial = "H10000000000"

        let day = new Date(); // 현재 시간 구하는 함수
        let tmp2 = day.getTime();
        let sleep = await Bed.findOne({ serial: serial, msg: "sleep" }).sort({"_id":-1}).limit(1);
        tmp1 = sleep.time;
        var en = await Enviroment_data.find({mh_sn: serial, time: {$gt : tmp1, $lt : tmp2} });
        var snore = await Snore_data.find({mh_sn: serial, time: {$gt : tmp1, $lt : tmp2} });
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

        var mat_ch = await Mat_data.find({mh_sn: serial});

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

        let mat_1 = await Mat_data.update({mh_sn: serial, time: {$gt : tmp1, $lt : tmp2} }, {
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
        }

        let bed_wake = await Bed.findOne({ serial: serial, msg: "wake" }).sort({"_id":-1}).limit(1);

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

        }
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };

    }

});

/////////////////////////////////////////////////////

const j9 = schedule.scheduleJob('0 0 16 * * *', async function(){
    try {
        console.log("16시 실행");

        serial = "H10000000000"

        let day = new Date(); // 현재 시간 구하는 함수
        //let cur_time = day.toLocaleString();
        let cur_time = day.getTime();
        let bed = await Bed.findOne({ serial: serial, msg: "sleep" }).sort({"_id":-1}).limit(1);
        if(bed){
            tmp = bed.sleep_seq + 1; //전 날 수면체크 + 1

            bed = new Bed({
                time : cur_time,
                msg : "sleep",
                sleep_seq: tmp,
                serial : "H10000000000"
                });
    
            const saveBed=await bed.save();
        }
        else{
            let tmp = 1;

            bed = new Bed({
            time : cur_time,
            msg : "sleep",
            sleep_seq: tmp,
            serial : "H10000000000"
            });
    
            const saveBed=await bed.save();
            const r1 = {
                code: 200,
                msg: 'sucess'
            };

        }
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };

    }

});

const j10 = schedule.scheduleJob('0 0 18 * * *', async function(){
    try {
        console.log("18시 실행");

        serial = "H10000000000"
        const rand = Math.floor(Math.random() * 4) + 1;
        let mat = await Mat_data.findOne({ mh_sn: serial }).sort({"_id":-1}).limit(1);
            if( 28 < mat.current_temp < 34){
                
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : rand
                };
            }
            else if(28>=mat.current_temp){
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : 4
                };
            }
            else if(32<=mat.current_temp){
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : 3
                };
            }

            var options = {
                qos:1
            };
            
            var bed_control = 'command/' + serial;

            client.publish(bed_control,JSON.stringify(mat_c),options);
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };

    }

});

const j11 = schedule.scheduleJob('0 0 20 * * *', async function(){
    try {
        console.log("20시 실행");

        serial = "H10000000000"
        const rand = Math.floor(Math.random() * 4) + 1;
        let mat = await Mat_data.findOne({ mh_sn: serial}).sort({"_id":-1}).limit(1);
            if( 28 < mat.current_temp < 34){
                
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : rand
                };
            }
            else if(28>=mat.current_temp){
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : 4
                };
            }
            else if(32<=mat.current_temp){
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "H10000000000",
                    "mat_command" : 3
                };
            }

            var options = {
                qos:1
            };
            
            var bed_control = 'command/' + serial;

            client.publish(bed_control,JSON.stringify(mat_c),options);
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };

    }

});
            
const j12 = schedule.scheduleJob('0 0 22 * * *', async function(){
    try {
        console.log("22시 실행");

        serial = "H10000000000"

        let day = new Date(); // 현재 시간 구하는 함수
        let tmp2 = day.getTime();
        let sleep = await Bed.findOne({ serial: serial, msg: "sleep" }).sort({"_id":-1}).limit(1);
        tmp1 = sleep.time;
        var en = await Enviroment_data.find({mh_sn: serial, time: {$gt : tmp1, $lt : tmp2} });
        var snore = await Snore_data.find({mh_sn: serial, time: {$gt : tmp1, $lt : tmp2} });
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

        var mat_ch = await Mat_data.find({mh_sn: serial});

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

        let mat_1 = await Mat_data.update({mh_sn: serial, time: {$gt : tmp1, $lt : tmp2} }, {
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
        }

        let bed_wake = await Bed.findOne({ serial: serial, msg: "wake" }).sort({"_id":-1}).limit(1);

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

        }
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };

    }

});
*/


/*
let p_options = {
    scriptPath: '/home/hadoop/Desktop/Medex/server',
    args: ['value1', 'value2', 'value3']/home/hadoop/Desktop/Medex/server
  };

let pyshell = new PythonShell('test.py', p_options)

Enviroment_data.find(function(err, a){
    if(err){
        console.log(err);
    }
    else{
        pyshell.send('hello')
    }
});

pyshell.send('hello')

pyshell.on('msg', (msg) => {
	console.log(msg)
})
*/
/*
app.post('/device/post',(req, res) => {  
    req.on('data',(data)=>{
        input=JSON.parse(data);
    })
    var obj = JSON.parse(req.body);

    console.log(req.body);
    console.log(input);

    var app_control = 'control/' + input.serialnumber
    client.publish(app_control, input.control);
    
    let f_d = Feedback_data({
        time : input.time,
        control : input.control,      
    });

    try{
        const saveFeedback_data=await f_d.save();
        console.log("Ack insert OK");
        }
        catch(err){
        console.log({input:err});
        }
});

app.set("port", "3003");
var server = http.createServer(app);
var io = require("socket.io")(server);
io.on("connection", (socket)=> {
    socket.on("app server received name", (data)=>{
        var obj = JSON.parse(data);
        client.publish("topic_name", obj.led + "");
    });
});
*/

/*

const j20 = schedule.scheduleJob('1 * * * * *', async function(){
    try {
        console.log("1초 실행");

        serial = "1234"
        let day = new Date(); // 현재 시간 구하는 함수
        //let cur_time = day.toLocaleString();
        let cur_time = day.getTime();
        let bed = await Bed.findOne({ serial: serial, msg: "sleep" }).sort({"_id":-1}).limit(1);
        if(bed){
            tmp = bed.sleep_seq + 1; //전 날 수면체크 + 1

            bed = new Bed({
                time : cur_time,
                msg : "sleep",
                sleep_seq: tmp,
                serial : "1234"
                });
    
            const saveBed=await bed.save();
        }
        else{
            let tmp = 1;

            bed = new Bed({
            time : cur_time,
            msg : "sleep",
            sleep_seq: tmp,
            serial : "1234"
            });
    
            const saveBed=await bed.save();
            const r1 = {
                code: 200,
                msg: 'sucess'
            };

        }
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };

    }

});

const j21 = schedule.scheduleJob('11 * * * * *', async function(){
    try {
        console.log("11초 실행");

        serial = "1234"
        const rand = Math.floor(Math.random() * 4) + 1;
        let mat = await Mat_data.findOne({ mh_sn: "H10000000000"}).sort({"_id":-1}).limit(1);
            if( 28 < mat.current_temp < 34){
                
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "1234",
                    "mat_command" : rand
                };
            }
            else if(28>=mat.current_temp){
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "1234",
                    "mat_command" : 4
                };
            }
            else if(32<=mat.current_temp){
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "1234",
                    "mat_command" : 3
                };
            }

            var options = {
                qos:1
            };
            
            var bed_control = 'command/' + serial;

            client.publish(bed_control,JSON.stringify(mat_c),options);
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };

    }

});

const j22 = schedule.scheduleJob('21 * * * * *', async function(){
    try {
        console.log("21초 실행");

        serial = "1234"
        const rand = Math.floor(Math.random() * 4) + 1;
        let mat = await Mat_data.findOne({ mh_sn: "H10000000000" }).sort({"_id":-1}).limit(1);
            if( 28 < mat.current_temp < 34){
                
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "1234",
                    "mat_command" : rand
                };
            }
            else if(28>=mat.current_temp){
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "1234",
                    "mat_command" : 4
                };
            }
            else if(32<=mat.current_temp){
                mat_c = {
                    "command_type" :5,
                    "mh_sn" : "1234",
                    "mat_command" : 3
                };
            }

            var options = {
                qos:1
            };
            
            var bed_control = 'command/' + serial;

            client.publish(bed_control,JSON.stringify(mat_c),options);
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };

    }

});
            
const j23 = schedule.scheduleJob('41 * * * * *', async function(){
    try {
        console.log("41초 실행");

        serial = "H10000000000"

        let day = new Date(); // 현재 시간 구하는 함수
        let tmp2 = day.getTime();
        let sleep = await Bed.findOne({ serial: "1234", msg: "sleep" }).sort({"_id":-1}).limit(1);
        tmp1 = sleep.time;
        var en = await Enviroment_data.find({mh_sn: serial, time: {$gt : tmp1, $lt : tmp2} });
        console.log("en : " + en);
        var snore = await Snore_data.find({mh_sn: serial, time: {$gt : tmp1, $lt : tmp2} });
        console.log("snore : " + snore);
        var tem_avg = 0;
        var hum_avg = 0;
        var co2_avg = 0;
        var pose_count =0;
        var snore_count =0;
        var snore_min = [];
        var s_count = 0;
        var mat_s_day = [];
        var m_count = 0;
        console.log("tmp1 : " + tmp1 + "tmp2 : " + tmp2);
        var sleep_time = Math.trunc((tmp2 - tmp1) /1000 /60 /60);
        console.log("수면시간 : " + sleep_time);

        var mat_ch = await Mat_data.find({mh_sn: serial});

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

        console.log(m_count + 1);
     
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
        }

        let bed_wake = await Bed.findOne({ serial: "1234", msg: "wake" }).sort({"_id":-1}).limit(1);

        if(bed_wake){
            var tmp = bed_wake.wake_seq + 1; //전 날 수면체크 + 1

            bed_wake = new Bed({
                time : tmp2,
                msg : "wake",
                wake_seq: tmp,
                serial : "1234"
            });

            const saveBed=await bed_wake.save();
        }
        else{
            let tmp = 1;

            bed_wake = new Bed({
                time : tmp2,
                msg : "wake",
                wake_seq: tmp,
                serial : "1234"
            });

            const saveBed=await bed_wake.save();
        }

        let today = await Today.findOne({ serial: "1234" }).sort({"_id":-1}).limit(1);

        if(today){
            let tmp = today.seq + 1; //전 날 수면체크 + 1

            today = new Today({
                serial: "1234",
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

            
        }
        else{
            let tmp = 1;

            today = new Today({
                serial: "1234",
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

        }
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };

    }

});
*/

/*
const j29 = schedule.scheduleJob('1 * * * * *', async function(){
    try {
        console.log("1초 실행");

        serial = "H10000000000"

        let day = new Date(); // 현재 시간 구하는 함수
        //let cur_time = day.toLocaleString();
        let cur_time = "1664506800000"
        let bed = await Bed.findOne({ serial: serial, msg: "sleep" }).sort({"_id":-1}).limit(1);
        if(bed){
            tmp = bed.sleep_seq + 1; //전 날 수면체크 + 1

            bed = new Bed({
                time : cur_time,
                msg : "sleep",
                sleep_seq: tmp,
                serial : "H10000000000"
                });
    
            const saveBed=await bed.save();
        }
        else{
            let tmp = 1;

            bed = new Bed({
            time : cur_time,
            msg : "sleep",
            sleep_seq: tmp,
            serial : "H10000000000"
            });
        

            const saveBed=await bed.save();
        }
        
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };

    }

});

const j30 = schedule.scheduleJob('6 * * * * *', async function(){
    try {
        console.log("06초 실행");

        serial = "H10000000000"

        let day = new Date(); // 현재 시간 구하는 함수
        let tmp2 = "1664528400000"
        let sleep = await Bed.findOne({ serial: serial, msg: "sleep" }).sort({"_id":-1}).limit(1);
        tmp1 = sleep.time;
        var en = await Enviroment_data.find({mh_sn: serial, time: {$gt : tmp1, $lt : tmp2} });
        var snore = await Snore_data.find({mh_sn: serial, time: {$gt : tmp1, $lt : tmp2} });
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
        console.log("수면시간 : " + sleep_time);

        var mat_ch = await Mat_data.find({mh_sn: serial});

        for(var i=0; i<mat_ch.length; i++){
            if(mat_ch[i].s_day>0){
                mat_s_day.push(mat_ch[i].s_day);
            }
        }
        console.log("s_day : " + mat_s_day);

        if(mat_s_day.length>0){
            for(var i=0; i<mat_s_day.length; i++){
                if(m_count < mat_s_day[i]){
                    m_count=mat_s_day[i];
                    
                }
            }
            console.log("매트 수면 카운트 : " + m_count);
        }
        console.log("매트 수면 카운트 : " + m_count);
        let mat_1 = await Mat_data.update({mh_sn: serial, time: {$gt : tmp1, $lt : tmp2} }, {
            $set: {
                s_day : m_count + 1
            }
            
        });
        
        // tmp1 ~ tmp2 사이 값 쿼리
        for( i=0; i<en.length; i++){
            tem_avg += en[i].ev_temp;


            if(i==en.length-1){
                tem_avg = tem_avg/en.length;
                console.log("tem_avg : " + tem_avg);
            }
        }

        for( i=0; i<en.length; i++){
            hum_avg += en[i].ev_hum;


            if(i==en.length-1){
                hum_avg = hum_avg/en.length;
                console.log("hum_avg : " + hum_avg);
            }
        }

        for( i=0; i<en.length; i++){
            co2_avg += en[i].ev_co2;


            if(i==en.length-1){
                co2_avg = co2_avg/en.length;
                console.log("co2_avg : " + co2_avg);
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
                
                


                if(snore[j].check == "1"){

                    s1 =Math.max(snore[j].snore_db1, snore[j].snore_db2, snore[j].snore_db3, snore[j].snore_db4, snore[j].snore_db5, 
                        snore[j].snore_db6, snore[j].snore_db7, snore[j].snore_db8, snore[j].snore_db9, snore[j].snore_db10);

                    snore_sec.push(s1);

                    s_count++;
                }

                
                if(j+2==snore.length){
                    
                    if(snore[j+1].check =="1"){
                        s4 = Math.max(snore[j+1].snore_db1, snore[j+1].snore_db2, snore[j+1].snore_db3, snore[j+1].snore_db4, snore[j+1].snore_db5, 
                            snore[j+1].snore_db6, snore[j+1].snore_db7, snore[j+1].snore_db8, snore[j+1].snore_db9, snore[j+1].snore_db10);

                        snore_sec.push(s4);
                        console.log(snore_sec);
                        s_count++;
                    }
                    
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
                    //console.log("코골이 : " + snore_min);
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
                    //console.log("코골이 : " + snore_min);
                }

                j++;
            }     
        }

        let bed_wake = await Bed.findOne({ serial: serial, msg: "wake" }).sort({"_id":-1}).limit(1);

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

        }

        console.log("End");
    }
    catch (error) {
        console.error(error.message);
        const result = {
            code: 500,
            msg: 'server error'
        };

    }

});
*/