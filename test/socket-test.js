const assert = require('assert');
const io = require('socket.io-client');

var socketURL = 'http://0.0.0.0:5000';

var options ={
  transports: ['websocket'],
  'force new connection': true
};

describe("Real Time App",function(){
  it('should broadcast the socketid', function() {

    var client1 = io.connect(socketURL, options);

    client1.on('connect', function(data){
      client1.emit('socketId', 'lllrrrj1l3krj;j');

      client1.on('socketId', function(data){
          assert.equal('lllrrrj1l3krj;j', data);
          client1.disconnect();
          done();
      });
    });
  });
});
