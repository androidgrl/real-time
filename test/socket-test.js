const assert = require('assert');
var io = require('socket.io-client');

var socketURL = 'http://localhost:3000';

var options ={
  transports: ['websocket'],
  'force new connection': true
};

describe("Scheduler",function(){
  xit('Should broadcast the time slot to all users', function(done){
    var client1 = io.connect(socketURL, options);

    client1.on('connect', function(data){
      client1.emit('slots', {slot: {"id": "1234"}, scheduleId: 3});

      client1.on('postSlots' + 3, function(data){
        assert.equal("slot", data);

        client1.disconnect();
        done();
      })
    });
  });
});
