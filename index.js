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

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res){
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/admin-dashboard', function(req, res){
  var schedule = new Schedule();
  var id = schedule.id;
  client.hmset('schedules', id, JSON.stringify(schedule));

  res.redirect('/admin-dashboard/' + id);
});

app.get('/admin-dashboard/:id', function (req, res) {
  var id = req.params.id;
  var host = req.headers.host;
  client.hgetall('schedules', function(err, schedules){
    var targetSchedule = schedules[id];
    res.render('admin-dashboard', {
      host: host,
      id: id,
      schedule: JSON.parse(targetSchedule)
    });
  });
});

app.get('/scheduling-page/:id', function (req, res) {
  var id = req.params.id;

  client.hgetall('schedules', function(err, schedules){
    var targetSchedule = _.find(schedules, function (schedule) {
      return JSON.parse(schedule).schedulingPageId === req.params.id;
    });
    res.render('scheduling-page', {
      schedule: JSON.parse(targetSchedule)
    });
  });
});

app.post('/admin-dashboard/slots', function (req, res){
  var slot = new Slot();
  var host = req.headers.host;

  slot.startTime = req.body.start;
  slot.endTime = req.body.end;
  slot.date = req.body.date;
  slot.comments = req.body.comments;

  var scheduleId = req.body.scheduleId;

  client.hgetall('schedules', function(err, schedules){
    var targetSchedule = JSON.parse(schedules[scheduleId]);
    targetSchedule.timeSlots.push(slot);
    client.hmset('schedules', scheduleId, JSON.stringify(targetSchedule));
  });
  res.status(200).send({slot: slot, scheduleId: scheduleId});
});

io.on('connection', function(socket) {
  console.log('A user has connected.');
  console.log(io.engine.clientsCount + ' user(s) now connected.');

  socket.on('disconnect', function() {
    console.log('A user has disconnected.');
  });

  socket.on('message', function(channel, message){
    if (channel==='slots'){
      io.sockets.emit('postSlots' + message.scheduleId, message);
    }
  });
});

http.listen(process.env.PORT || 3000, function(){
  console.log('Your server is up and running on Port 3000. Good job!');
});
//check with redis-cli, keys *, hgetall "polls"
//flushall
