const socket = io();

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
        socket.send('slots', data);
        $('#start').val('');
        $('#end').val('');
        $('#date').val('');
        $('#comments').val('');
      });
}

function makeSlot(data) {
  console.log(data);
  var compiled = _.template("<div data-start='<%= start %>' data-end='<%= end %>' data-date='<%= date %>' data-comments='<%= comments %>'><li>Start Time: <%= start %> </li><li>End Time: <%= end %> </li><li>Date: <%= date %></li><li>Comments: <%= comments %></li></div></br>");
  var newSlot = compiled({'start': data.slot.startTime,
    'end': data.slot.endTime,
    'date': data.slot.date,
    'comments': data.slot.comments
  });
  return newSlot;
}

socket.on('postSlots', function(data) {
  $('#scheduling-slots').append(makeSlot(data));
});

$('document').ready(function(){
  $('#submit').on('click', postData);
});
