const socket = io();
const start = $('#start');
const end = $('#end');
const date = $('#date');
const comments = $('#comments');
const idOfSchedule = $('#schedule-id');
const adminPageSlots = $('#slots');
const scheduleingPageSlots = $('#scheduling-slots');
const radioButtons = $('.radio-btn');
const submit = $('#submit');

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
  var compiled = _.template("<div class='radio' id='slot'><label><input class='radio-btn' type='radio' name='optradio' data-id='<%= id %>' data-start='<%= start %>' data-end='<%= end %>' data-date='<%= date %>' data-comments='<%= comments %>'><p>Start Time: <%= start %></p><p>End Time: <%= end %> </p><p>Date: <%= date %></p><p>Comments: <%= comments %></p></label></div>");
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

function sendSlot() {
  socket.send('selectSlot', this.dataset);
}

socket.on('disableSlot', function (data) {
  $("input[data-id='" + data.id +"']").addClass('disabled');
  $("input[data-id='" + data.id +"']").removeClass('radio-btn');
  var parent = $("input[data-id='" + data.id +"']").parent();
});

$('document').ready(function(){
  submit.on('click', postData);
  adminPageSlots.delegate('.radio-btn', 'click', sendSlot);
  scheduleingPageSlots.delegate('.radio-btn', 'click', sendSlot);
});
