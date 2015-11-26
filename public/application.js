const socket = io();
const start = $('#start');
const end = $('#end');
const date = $('#date');
const comments = $('#comments');
const idOfSchedule = $('#schedule-id');
const username = $('#username');
const adminPageSlots = $('#slots');
const scheduleingPageSlots = $('#scheduling-slots');
const radioButtons = $('.radio-btn');
const submit = $('#submit');
const deleteButton = $('#delete');

socket.on('connect', function (){
  console.log(socket.id, 'socket id');
});

socket.on('updateSlots' + scheduleId, function (data){
  scheduleingPageSlots.html('');
  makeScheduleSlots(data);
  adminPageSlots.html('');
  makeAdminSlots(data);
});

socket.on('socketId', function(socketId) {
  if (getCookie('socketid')) {
    document.cookie = 'socketid=' + getCookie('socketid');
  } else {
    document.cookie = 'socketid=' + socketId;
  }
});

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

function formData (){
  return {
    start: start.val(),
    end: end.val(),
    date: date.val(),
    comments: comments.val(),
    scheduleId: idOfSchedule.val()
  };
}

function postData (){
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

function makeScheduleSlots (data){
  data.targetSchedule.timeSlots.forEach(function (slot){
    var compiled = _.template("<div class='radio' id='slot'><label><input class='radio-btn' type='radio' name='optradio' data-id='<%= id %>' data-scheduleId='<%= scheduleId %>' data-studentId='<%= studentId %>' data-active='<%= active %>' data-start='<%= start %>' data-end='<%= end %>' data-date='<%= date %>' data-comments='<%= comments %>'><p>Start Time: <%= start %></p><p>End Time: <%= end %> </p><p>Date: <%= date %></p><p>Comments: <%= comments %></p></label></div>");
    var newSlot = compiled({
      'start': slot.startTime,
      'end': slot.endTime,
      'date': slot.date,
      'comments': slot.comments,
      'id': slot.id,
      'scheduleId': slot.scheduleId,
      'active': slot.active,
      'studentId': slot.studentId
    });
    scheduleingPageSlots.append(newSlot);

    if (!slot.active) {
      if (slot.studentId === getCookie('socketid')) {
        $("input[data-id='" + slot.id +"']").parent().parent().addClass('label-green');
        $("input[data-id='" + slot.id +"']").parent().append("<button class='btn btn-danger' id='cancel' data-id='" + slot.id + "' data-scheduleId='" + slot.scheduleId + "'>Cancel Reservation</button>");
      } else {
        $("input[data-id='" + slot.id +"']").parent().parent().addClass('label-grey');
      }
    }
  });
}

function makeAdminSlots (data){
  data.targetSchedule.timeSlots.forEach(function (slot){
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
    var username = slot.username || "No Name Given";
    if (!slot.active) {
      $("div[data-id='" + slot.id +"']").append("<p>Slot taken by: " + username + "</p>");
    } else {
      $("div[data-id='" + slot.id +"']").append("<button class='btn btn-danger' id='delete' data-id='" + slot.id +"' data-scheduleId='" + slot.scheduleId + "'>Delete Slot</button>");
    }
  });
}

function deleteSlot () {
  socket.send('deleteSlot', this.dataset);
}

function cancelSlot() {
  socket.send('cancelSlot', this.dataset);
}

function sendSlot () {
  this.dataset['socketid'] = getCookie('socketid');
  socket.send('selectSlot', {dataset: this.dataset, username: username.val()});
}

$('document').ready(function (){
  submit.on('click', postData);
  adminPageSlots.delegate('#delete', 'click', deleteSlot);
  scheduleingPageSlots.delegate('#cancel', 'click', cancelSlot);
  adminPageSlots.delegate('.radio-btn', 'click', sendSlot);
  scheduleingPageSlots.delegate('.radio-btn', 'click', sendSlot);
  makeScheduleSlots(schedule);
  makeAdminSlots(schedule);
  $(function() {
    $('#datetimepicker1').datetimepicker({
      format: 'LT'
    });
    $('#datetimepicker2').datetimepicker({
      format: 'LT'
    });
    $('#datetimepicker3').datetimepicker({
      format: 'L'
    });

  });
});
