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

function makeScheduleSlots(data) {
  data.targetSchedule.timeSlots.forEach(function (slot) {
    var compiled = _.template("<div class='radio' id='slot'><label><input class='radio-btn' type='radio' name='optradio' data-id='<%= id %>' data-scheduleId='<%= scheduleId %>' data-active='<%= active %>' data-start='<%= start %>' data-end='<%= end %>' data-date='<%= date %>' data-comments='<%= comments %>'><p>Start Time: <%= start %></p><p>End Time: <%= end %> </p><p>Date: <%= date %></p><p>Comments: <%= comments %></p></label></div>");
    var newSlot = compiled({
      'start': slot.startTime,
      'end': slot.endTime,
      'date': slot.date,
      'comments': slot.comments,
      'id': slot.id,
      'scheduleId': slot.scheduleId,
      'active': slot.active
    });
    scheduleingPageSlots.append(newSlot);
  });
}

function makeAdminSlots(data) {
  data.targetSchedule.timeSlots.forEach(function (slot) {
    var compiled = _.template("<div id='slot' data-id='<%= id %>' data-scheduleId='<%= scheduleId %>' data-active='<%= active %>' data-start='<%= start %>' data-end='<%= end %>' data-date='<%= date %>' data-comments='<%= comments %>'><p>Start Time: <%= start %></p><p>End Time: <%= end %> </p><p>Date: <%= date %></p><p>Comments: <%= comments %></p></label></div>");
    var newSlot = compiled({
      'start': slot.startTime,
      'end': slot.endTime,
      'date': slot.date,
      'comments': slot.comments,
      'id': slot.id,
      'scheduleId': slot.scheduleId,
      'active': slot.active
    });
    adminPageSlots.append(newSlot);
    if (!slot.active) {
      //$("input[data-id='" + slot.id +"']").addClass('disabled');
      //$("input[data-id='" + slot.id +"']").removeClass('radio-btn');
      console.log(slot.studentId, socket.id, "************ids");
      if (slot.studentId === socket.id) {
        $("input[data-id='" + slot.id +"']").parent().parent().addClass('label-green');
      } else {
        $("input[data-id='" + slot.id +"']").parent().parent().addClass('label-grey');
      }
    }
  });
}

socket.on('postSlots' + scheduleId , function(data) {
  scheduleingPageSlots.html('');
  makeScheduleSlots(data);
  adminPageSlots.html('');
  makeAdminSlots(data);
});

socket.on('updateSlots', function (data) {
  scheduleingPageSlots.html('');
  makeScheduleSlots(data);
  adminPageSlots.html('');
  makeAdminSlots(data);
});

function sendSlot() {
  socket.send('selectSlot', this.dataset);
}

socket.on('disableSlot', function (data) {
  $("input[data-id='" + data.id +"']").addClass('disabled');
  $("input[data-id='" + data.id +"']").removeClass('radio-btn');
  $("input[data-id='" + data.id +"']").parent().addClass('label-grey');
});

socket.on('highlightSlot', function (data) {
  $("input[data-id='" + data.id +"']").parent().addClass('label-green');
});

$('document').ready(function(){
  submit.on('click', postData);
  adminPageSlots.delegate('.radio-btn', 'click', sendSlot);
  scheduleingPageSlots.delegate('.radio-btn', 'click', sendSlot);
});
