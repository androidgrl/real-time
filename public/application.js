const socket = io();
var voteCounts = document.getElementById('vote-counts');
var pollResults = document.getElementById('poll-results');
var endPollButton = document.getElementById('end-poll');
var votingButtons = document.querySelectorAll('input[type="radio"]');

function formData(){
  return {
    start: $('#start').val(),
    end: $('#end').val(),
    date: $('#date').val(),
    comments: $('#comments').val(),
    scheduleId: $('#schedule-id').val()
  };
}

function postData(){
  $.post('/admin-dashboard/slots',
      formData(),
      function(data){
        $('#slots').append(makeSlot(data));
        $('#start').val('');
        $('#end').val('');
        $('#date').val('');
        $('#comments').val('');
      });
}

function makeSlot(data) {
  console.log(data);
  var compiled = _.template("<div data-start='<%= start %>' data-end='<%= end %>' data-date='<%= date %>' data-comments='<%= comments %>'><li>Start Time: <%= start %> </li><li>End Time: <%= end %> </li><li>Date: <%= date %></li><li>Comments: <%= comments %></li></div>");
    var newSlot = compiled({'start': data.slot.startTime,
                            'end': data.slot.endTime,
                            'date': data.slot.date,
                            'comments': data.slot.comments
                        });
    return newSlot;
}

$('document').ready(function(){
  $('#submit').on('click', postData);
});

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
