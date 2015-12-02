const assert = require('assert');
const io = require('socket.io-client');

var socketURL = 'http://localhost:9876';

var options ={
  transports: ['websocket'],
  'force new connection': true
};

describe("Real Time App",function(){
  it('should broadcast the socketid', function() {

    var client1 = io.connect(socketURL, options);

    var client2 = io.connect(socketURL, options);

    client1.send('socketId', 'lllrrrj1l3krj;j');

    client2.on('socketId', function(data){
      assert.equal('lllrrrj1l3krj;j', data);
      client1.disconnect();
      client2.disconnect();
      done();
    });
  });

  it('should send selected slot', function() {

    var client1 = io.connect(socketURL, options);

    client1.on('connect', function(data){
      console.log("connected***********************************");
      var client2 = io.connect(socketURL, options);

      client1.send('selectSlot', {dataset: {socketid: "123", scheduleid: "345", id: "789"}, username: "Bob"});

      client2.on('selectSlot', function(data){
        assert.deepEqual("{dataset: {socketid: '123', scheduleid: '345', id: '789'}, username: 'Bob}", data);
        client1.disconnect();
        client2.disconnect();
      });
    });
  });
});
