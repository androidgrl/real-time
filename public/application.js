const socket = io();
const start = $('#start');
const end = $('#end');
const date = $('#date');
const comments = $('#comments');
const idOfSchedule = $('#schedule-id');
const adminPageSlots = $('#slots');
const scheduleingPageSlots = $('#scheduling-slots');

socket.on('connect', function(){
  console.log(socket.id, 'socket id');
});

function formData(){
  return {
    start: start.val(),
    end: end.val(),
    date: date.val(),
    comments: comments.val(),
    scheduleId: idOfSchedule.val()
  };
}

function postData(){
  $.post('/admin-dashboard/slots',
      formData(),
      function(data){
        socket.send('slots', data);
        start.val('');
        end.val('');
        date.val('');
        comments.val('');
      });
}

function makeSlot(data) {
  var compiled = _.template("<div id='slot' data-id='<%= id %>' data-start='<%= start %>' data-end='<%= end %>' data-date='<%= date %>' data-comments='<%= comments %>'><li>Start Time: <%= start %> </li><li>End Time: <%= end %> </li><li>Date: <%= date %></li><li>Comments: <%= comments %></li></div>");
  var newSlot = compiled({
    'start': data.slot.startTime,
    'end': data.slot.endTime,
    'date': data.slot.date,
    'comments': data.slot.comments,
    'id': data.slot.id
  });
  return newSlot;
}

socket.on('postSlots' + scheduleId , function(data) {
  scheduleingPageSlots.append(makeSlot(data));
  adminPageSlots.append(makeSlot(data));
});

$('document').ready(function(){
  $('#submit').on('click', postData);
});
