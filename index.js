require('dotenv').load();
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const bodyParser = require('body-parser');
const Schedule = require('./lib/schedule');
const Slot = require('./lib/slot');
const _ = require('lodash');

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis");
  var client = redis.createClient(rtg.port, rtg.hostname, {no_ready_check: true});
  client.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require("redis");
  var client = require("redis").createClient(process.env.REDIS_URL);
}

app.set('view engine', 'ejs');
app.use(express.static('public'));
var ejsLayouts = require("express-ejs-layouts");
app.use(ejsLayouts);
app.set("views","./views");
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res){
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/admin-dashboard', function (req, res){
  var schedule = new Schedule();
  var id = schedule.id;
  client.hmset('schedules', id, JSON.stringify(schedule));
  res.redirect('/admin-dashboard/' + id);
});

app.get('/admin-dashboard/:id', function (req, res){
  var id = req.params.id;
  var host = req.headers.host;
  client.hgetall('schedules', function (err, schedules){
    var targetSchedule = schedules[id];
    res.render('admin-dashboard', {
      host: host,
      id: id,
      schedule: JSON.parse(targetSchedule)
    });
  });
});

app.get('/scheduling-page/:id', function (req, res){
  var id = req.params.id;
  client.hgetall('schedules', function (err, schedules){
    var targetSchedule = _.find(schedules, function (schedule) {
      return JSON.parse(schedule).schedulingPageId === req.params.id;
    });
    res.render('scheduling-page', {
      schedule: JSON.parse(targetSchedule)
    });
  });
});

function createNewSlot(req, slot) {
  slot.startTime = req.body.start;
  slot.endTime = req.body.end;
  slot.date = req.body.date;
  slot.comments = req.body.comments;
  slot.scheduleId = req.body.scheduleId;
  slot.username = req.body.username;
}

function addSlotToSchedule(scheduleId, slot, res) {
  client.hgetall('schedules', function (err, schedules){
    var targetSchedule = JSON.parse(schedules[scheduleId]);
    targetSchedule.timeSlots.push(slot);
    client.hmset('schedules', scheduleId, JSON.stringify(targetSchedule));
    res.status(200).send({slot: slot, scheduleId: scheduleId, targetSchedule: targetSchedule});
  });
}

app.post('/admin-dashboard/slots', function (req, res){
  var slot = new Slot();
  createNewSlot(req, slot);
  var scheduleId = req.body.scheduleId;
  addSlotToSchedule(scheduleId, slot, res);
});

io.on('connection', function (socket){

  socket.emit('socketId', socket.id);

  socket.on('message', function (channel, message){
    if (channel==='timeZone'){
      io.sockets.emit('broadcastTime', message);
    }
    if (channel==='slots'){
      io.sockets.emit('updateSlots' + message.scheduleId, message);
    }
    if (channel==='selectSlot') {
      client.hgetall('schedules', function (err, schedules){
        var targetSchedule = JSON.parse(schedules[message.dataset.scheduleid]);
        var targetTimeSlot = _.find(targetSchedule.timeSlots, function (slot) {
          return slot.id === message.dataset.id;
        });
        var timeSlotsAlreadyTaken = _.filter(targetSchedule.timeSlots, function (slot) {
          return slot.studentId;
        });
        var timeSlotWithSameStudentId = _.find(timeSlotsAlreadyTaken, function (slot) {
          return slot.studentId === message.dataset.socketid;
        });
        if (timeSlotsAlreadyTaken.length > 0) {
          if (timeSlotWithSameStudentId) {
            if (!targetTimeSlot.studentId) {
              timeSlotWithSameStudentId.studentId = null;
              timeSlotWithSameStudentId.active = true;
              timeSlotWithSameStudentId.username = null;
              targetTimeSlot.studentId = message.dataset.socketid;
              targetTimeSlot.active = false;
              targetTimeSlot.username = message.username;
            }
          } else if (!targetTimeSlot.studentId) {
            targetTimeSlot.studentId = message.dataset.socketid;
            targetTimeSlot.active = false;
            targetTimeSlot.username = message.username;
          }
        } else {
          targetTimeSlot.studentId = message.dataset.socketid;
          targetTimeSlot.active = false;
          targetTimeSlot.username = message.username;
        }
        client.hmset('schedules', message.dataset.scheduleid, JSON.stringify(targetSchedule));
        io.sockets.emit('updateSlots' + message.dataset.scheduleid, {targetSchedule: targetSchedule, targetTimeSlot: targetTimeSlot});
      });
    }
    if (channel === 'deleteSlot') {
      client.hgetall('schedules', function (err, schedules){
        var targetSchedule = JSON.parse(schedules[message.scheduleid]);
        var updatedTimeSlots = _.reject(targetSchedule.timeSlots, function (slot) {
          return slot.id === message.id;
        });
        targetSchedule.timeSlots = updatedTimeSlots;
        client.hmset('schedules', message.scheduleid, JSON.stringify(targetSchedule));
        io.sockets.emit('updateSlots' + message.scheduleid, {targetSchedule: targetSchedule});
      });
    }
    if (channel === 'cancelSlot') {
      client.hgetall('schedules', function (err, schedules){
        var targetSchedule = JSON.parse(schedules[message.scheduleid]);
        var targetTimeSlot = _.find(targetSchedule.timeSlots, function (slot) {
          return slot.id === message.id;
        });
        targetTimeSlot.studentId = null;
        targetTimeSlot.active = true;
        client.hmset('schedules', message.scheduleid, JSON.stringify(targetSchedule));
        io.sockets.emit('updateSlots' + message.scheduleid, {targetSchedule: targetSchedule});
      });
    }
  });
});

if(!module.parent){
  http.listen(process.env.PORT || 3000, function (){
    console.log('Your server is up and running on Port 3000. Good job!');
  });
}

module.exports = app;
