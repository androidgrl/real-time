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
//const redis = require('redis');
//const client = redis.createClient(process.env.REDIS_URL);


if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis");
  var client = redis.createClient(rtg.port, rtg.hostname, {no_ready_check: true});

  redis.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require("redis").createClient();
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

//app.post('/create', function (req, res){
//var poll = new Poll();
//var host = req.headers.host;

//poll.question = req.body.question;
//poll.addChoice(req.body.choice1);
//poll.addChoice(req.body.choice2);
//poll.addChoice(req.body.choice3);
//console.log(poll, "#1 poll object");
//client.hmset('polls', poll.id, JSON.stringify(poll));

//res.render('create', {
//poll: poll,
//host: host
//});
//});

app.get('/vote/:id', function (req, res) {
  client.hgetall('polls', function(err, polls){
    var targetPoll = _.find(polls, function (poll) {
      return JSON.parse(poll).voterId === req.params.id;
    });
    res.render('votes', {
      poll: JSON.parse(targetPoll)
    });
  });
});

app.get('/admin/:id', function (req, res) {
  client.hgetall('polls', function(err, polls){
    var targetPoll = polls[req.params.id];
    res.render('admin', {
      poll: JSON.parse(targetPoll),
      votes: countVotes(targetPoll.votes)
    });
  });
});

io.on('connection', function(socket) {
  console.log('A user has connected.');
  console.log(io.engine.clientsCount + ' user(s) now connected.');

  socket.emit('socketId', socket.id);

  socket.on('disconnect', function() {
    console.log('A user has disconnected.');
  });

  socket.on('message', function(channel, message) {
    if (channel === 'voteCast') {
      client.hgetall('polls', function(err, polls){
        var targetPoll = JSON.parse(polls[message.pollId]);
        if (targetPoll.isOpen) {
          targetPoll.votes[message.socketId] = message.choice;
          client.hmset('polls', message.pollId, JSON.stringify(targetPoll));
          io.sockets.emit('voteCount', countVotes(targetPoll.votes));
        }
      });
    }

    if (channel === 'endPoll') {
      console.log(message, 'message when endPoll');
      client.hgetall('polls', function(err, polls){
        var targetPoll = JSON.parse(polls[message.pollId]);
        targetPoll.isOpen = false;
        client.hmset('polls', message.pollId, JSON.stringify(targetPoll));
      });
    }
  });
});

http.listen(process.env.PORT || 3000, function(){
  console.log('Your server is up and running on Port 3000. Good job!');
});
//check with redis-cli, keys *, hgetall "polls"
//flushall
