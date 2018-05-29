var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var client  = mqtt.connect('mqtt://jamesmooth.win:8000s')
var status = false

client.on('connect', function () {
  client.subscribe('PIR_sensor/1/status')
  client.subscribe('PIR_sensor/2/status')
  client.subscribe('PIR_sensor/3/status')
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  status = message.toString();
  if(status == 'true'){
    motionSensor
    .getService(Service.MotionSensor)
    .updateCharacteristic(Characteristic.MotionDetected, true);
  }
  else{
    motionSensor
    .getService(Service.MotionSensor)
    .updateCharacteristic(Characteristic.MotionDetected, false);
  }
}) // end call back mqtt function

// here's a fake hardware device that we'll expose to HomeKit
var MOTION_SENSOR = {
  motionDetected: false,

  getStatus: function() {
    //set the boolean here, this will be returned to the device
    MOTION_SENSOR.motionDetected = status;
  },
  identify: function() {
    console.log("Identify the motion sensor!");
  }
}

// Generate a consistent UUID for our Motion Sensor Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "motionsensor".
var motionSensorUUID = uuid.generate('hap-nodejs:accessories:motionsensor');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake motionSensor.
var motionSensor = exports.accessory = new Accessory('Motion Sensor', motionSensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
motionSensor.username = "1A:2B:3D:4D:2E:AF";
motionSensor.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
motionSensor
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Oltica")
  .setCharacteristic(Characteristic.Model, "Rev-1")
  .setCharacteristic(Characteristic.SerialNumber, "A1S2NASF88EW");

// listen for the "identify" event for this Accessory
motionSensor.on('identify', function(paired, callback) {
  MOTION_SENSOR.identify();
  callback(); // success
});

motionSensor
  .addService(Service.MotionSensor, "Fake Motion Sensor") // services exposed to the user should have "names" like "Fake Motion Sensor" for us
  .getCharacteristic(Characteristic.MotionDetected)
  .on('get', function(callback) {
     MOTION_SENSOR.getStatus();
     callback(null, Boolean(MOTION_SENSOR.motionDetected));
});
