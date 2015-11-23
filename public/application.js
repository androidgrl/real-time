var socket = io();

var voteCounts = document.getElementById('vote-counts');
var pollResults = document.getElementById('poll-results');
var endPollButton = document.getElementById('end-poll');
var votingButtons = document.querySelectorAll('input[type="radio"]');

socket.on('socketId', function(socketId) {
  if (getCookie('socketid')) {
    document.cookie = 'socketid=' + getCookie('socketid');
  } else {
    document.cookie = 'socketid=' + socketId;
  }
});

socket.on('voteCount', function(votes) {
  var results = '';

  for (var choice in votes) {
    results = results + '<p>' + choice + ': ' + votes[choice] + '</p>';
  }

  pollResults.innerHTML = results;
});

for (var i = 0; i < votingButtons.length; i++) {
  votingButtons[i].addEventListener('click', function () {
    this.dataset['socketId'] = getCookie('socketid');
    socket.send('voteCast', this.dataset);
  });
}

//endPollButton.addEventListener('click', function () {
  //socket.send('endPoll', this.dataset);
//});

function getCookie(cname) {
  var name = cname + '=';
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1);
    if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
  }
  return '';
}
