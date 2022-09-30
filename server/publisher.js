var mqtt = require('mqtt');
var client = mqtt.connect("mqtt://220.149.244.199:1833");

buf ={
    "mh_sn":"123123"
};

buf_e={
    "mh_sn" : "123123",
    "ev_temp" : 36.5,
    "ev_hum" : 27,
    "ev_co2" : 10.25,
    "time" : 202109051553
}

buf_p={
    "mh_sn" : 123123,
    "pitch_angle" : 108,
    "roll_angle" : 92,
    "pose_type" : 1,
    "time" : 1664240
}

buf_s={
    "mh_sn" : "123123",
    "snore_db" : (52,61,60,60,61,62,63,66),
    "time" : 166421
}

buf_b={
    "mh_sn" : "123123",
    "angle" : (180,142,152,123,150),
    "bed_status" : 1,
    "time" : 166614,
    "cmd_no" : "166614_123123"
}

buf_m={
    "mh_sn" : "123123",
    "current_temp" : 31,
    "setting_temp" : 35,
    "off_time" : 0,
    "on_time" : 0,
    "mode" : 1,
    "mat_status" : 1,
    "time" : 1666,
    "cmd_no" : "1666_123123"
}

buf_a={
    "command_type" : 1,
    "error_type" : 0,
    "cmd_no" : "1666_123123"
}

client.on('connect',function(){
client.subscribe('connect');
client.publish('connect',JSON.stringify(buf));
});

client.on('connect',function(){
    client.subscribe('env_data/123123');
    client.publish('env_data/123123',JSON.stringify(buf_e));
    });

client.on('connect',function(){
    client.subscribe('pose_data/123123');
    client.publish('pose_data/123123',JSON.stringify(buf_p));
    });

client.on('connect',function(){
    client.subscribe('snore_data/123123');
    client.publish('snore_data/123123',JSON.stringify(buf_s));
    });

client.on('connect',function(){
    client.subscribe('bed_data/123123');
    client.publish('bed_data/123123',JSON.stringify(buf_b));
    });
    
client.on('connect',function(){
    client.subscribe('mat_data/123123');
    client.publish('mat_data/123123',JSON.stringify(buf_m));
    });

client.on('connect',function(){
    client.subscribe('ack/123123');
    client.publish('ack/123123',JSON.stringify(buf_a));
    });

client.on('message',function(topic,message){
console.log(topic+' : send');
client.end();
});