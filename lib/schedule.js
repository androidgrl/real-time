const crypto = require('crypto');
var redis = require("redis");
var client = require("redis").createClient(process.env.REDIS_URL);

function generateHash() {
  return crypto.randomBytes(20).toString('hex');
}

function Schedule() {
  this.id = generateHash();
  this.schedulingPageId = generateHash();
  this.schedulingPageUrl = '/scheduling-page/' + this.schedulingPageId;
  this.timeSlots = [];
}

Schedule.prototype.save = function(attrs) {
  // save the thing...
}

Schedule.prototype.generateSlot = function(attrs) {
  var slot = new Slot(scheduleId: this.id);
  return slot;
}

Schedule.find = function(id, callback) {
  client.hgetall('schedules', function (err, schedules) {
    var scheduleAttrs = schedules[id]; // JSON object
    var schedule = new Schedule(scheduleAttrs);
    callback(schedule);
  });
}

module.exports = Schedule;
