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
var client =mqtt.connect('???');
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
        console.log(data + '\n\n' + "AI motion bed parering" + '\n\n');
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
            //console.log("insert OK");
            //console.log(MH_sn);
            }
            catch(err){
            console.log({message:err});
            }
    }
    
    var env_t= 'env_data/' + MH_sn;    

    if(topic===env_t){
        var env_data= JSON.parse(message);
        //console.log(env_data);
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
        //console.log(pose_data);
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
        
        //console.log("snore data insert" + '\n');
        //console.log(snore_data);

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
                "head_count" : 5,
                "foot_count" : 0
            };

            var options = {
                qos:1
            };

            var bed_control = 'command/' + MH_sn;

            if(check){
                if(parseInt(check.time) + 1000 < cur_time){
                    if(check.count < 45){
                        client.publish(bed_control,JSON.stringify(bed_c),options);
                        if(check.count){
                            checkc = check.count;
                        }
                        else{
                            checkc = 0;
                        }
                        let sch = S_ch({
                            serial : snore_data.mh_sn,
                            time : cur_time,
                            count : checkc + 5
                        });
                        try{
                            const saveS_ch=await sch.save();
                            //console.log("Snore data insert OK");
                            }
                        catch(err){
                            console.log({message:err});
                            }
                    }
                    else{
                        console.log("maximum angle");
                    }
                }       
            }
            else{
                let sch = S_ch({
                    serial : snore_data.mh_sn,
                    time : cur_time,
                    count : 5
                });
                client.publish(bed_control,JSON.stringify(bed_c),options);
                try{
                    const saveS_ch=await sch.save();
                    //console.log("Snore data insert OK");
                    }
                catch(err){
                    console.log({message:err});
                    }
            }
        }
        else{
            bed_c = {
                "function_mode" : 1,
                "command_type" :4,
                "mh_sn" : MH_sn,
                "head_count" : -5,
                "foot_count" : 0
            };

            var options = {
                qos:1
            };
            var bed_control = 'command/' + MH_sn;

            if(check){
                if(parseInt(check.time) + 120000 < cur_time){
                    if(check.count){
                        checkc = check.count;
                    }
                    else{
                        checkc = 0;
                    }
                    let sch = S_ch({
                        serial : snore_data.mh_sn,
                        time : cur_time,
                        count : checkc - 5
                    });
                    client.publish(bed_control,JSON.stringify(bed_c),options);
                    try{
                        const saveS_ch=await sch.save();
                        //console.log("Snore data insert OK");
                        }
                    catch(err){
                        console.log({message:err});
                        }
                }
            }
            else{
                client.publish(bed_control,JSON.stringify(bed_c),options);
                let sch = S_ch({
                    serial : snore_data.mh_sn,
                    time : cur_time,
                    count : 0
                });
                try{
                    const saveS_ch=await sch.save();
                    //console.log("Snore data insert OK");
                    }
                catch(err){
                    console.log({message:err});
                    }
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
            //console.log("Snore data insert OK");
            }
        catch(err){
            console.log({message:err});
            }
    }

    var bed_t= 'bed_data/' + MH_sn;

    if(topic===bed_t){
        
        //var bed_data= JSON.parse(message);
        
        //console.log(bed_data);
        
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
        //console.log(mat_data);
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
    try {
        var sid = req.body.serialnum
        var msg = req.body.btnnum;

        var options = {
            qos:1
        };

        var bed_control = 'command/' + sid;
        
        if(msg== "headup" ){
            bed_c = {
                "function_mode" : 1,
                "command_type" :4,
                "mh_sn" : sid,
                "head_count" : 3,
                "foot_count" : 0
            };
        }
        else if(msg == "headdown"){
            bed_c = {
                "function_mode" : 1,
                "command_type" :4,
                "mh_sn" : sid,
                "head_count" : -3,
                "foot_count" : 0
            };
        }
        else if(msg == "legup"){
            bed_c = {
                "function_mode" : 1,
                "command_type" :4,
                "mh_sn" : sid,
                "head_count" : 0,
                "foot_count" : 3
            };       
        }
        else if(msg == "legdown"){
            bed_c = {
                "function_mode" : 1,
                "command_type" :4,
                "mh_sn" : sid,
                "head_count" : 0,
                "foot_count" : -3
            };
        }
        else if(msg == "flat"){
            bed_c = {
                "function_mode" : 2,
                "command_type" :4,
                "mh_sn" : sid,
                "head_count" : 0,
                "foot_count" : 0
            };
        }
        else if(msg == "zg"){
            bed_c = {
                "function_mode" : 4,
                "command_type" :4,
                "mh_sn" : sid,
                "head_count" : 0,
                "foot_count" : 0
            };
        }

        console.log(bed_c + '\n\n' + "remote control" + '\n\n');
        client.publish(bed_control,JSON.stringify(bed_c),options);

        const result = {
            code: 200,
            msg: 'sucess'
        };
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

    //console.log(req.body);

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
            client.publish(bed_control,JSON.stringify(mat_c),options);
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
            client.publish(bed_control,JSON.stringify(mat_c),options);
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
            client.publish(bed_control,JSON.stringify(mat_c),options);
            res.send(result);
        }
        else if(msg == "now"){
            let mat = await Mat_data.findOne({ mh_sn: sid }).sort({"_id":-1}).limit(1);
            //console.log(mat);
            const result_now = {
                code: 200,
                msg: 'sucess',
                temp : mat.current_temp 
            };
            res.send(result_now);
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
