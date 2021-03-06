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

socket.on('updateSlots' + scheduleId, function (data) {
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
    while (c.charAt(0) ===' ') c = c.substring(1);
    if (c.indexOf(name) === 0) return c.substring(name.length,c.length);
  }
  return '';
}

function formData () {
  var startDateTimeRaw = start.val() + date.val();
  var startDateTime = moment(startDateTimeRaw, "h:mm AMM-DD-YYYY").utc().format();
  var localStartTime = moment(start.val(), "h:mm A");
  var utcStartTime = localStartTime.utc().format();
  var localEndTime = moment(end.val(), "h:mm A");
  var utcEndTime = localEndTime.utc().format();
  return {
    start: utcStartTime,
    end: utcEndTime,
    date: startDateTime,
    comments: comments.val(),
    scheduleId: idOfSchedule.val()
  };
}

function checkFields() {
  if (start.val() === "" || end.val() === "" || date.val() === "") {
    alert("Please fill in all of the fields. ^_^");
    return false;
  } else {
    return true;
  }
}

function postData () {
  if (checkFields()) {
    $.post('/admin-dashboard/slots',
           formData(),
           function(data) {
             socket.send('slots', data);
             start.val('');
             end.val('');
             date.val('');
             comments.val('');
           });
  }
}

function makeScheduleSlots (data) {
  var timezone = jstz.determine().name();
  data.targetSchedule.timeSlots.forEach(function (slot) {
    var offset = moment().format('ZZ');
    var startTime = moment(slot.startTime).utcOffset(offset).format("h:mm A") + " " + timezone;
    var endTime = moment(slot.endTime).utcOffset(offset).format("h:mm A") + " " + timezone;
    var dateTime = moment(slot.date).utcOffset(offset).format("MM/DD/YYYY");
    var compiled = _.template("<div class='radio' id='slot'><label><input class='radio-btn' type='radio' name='optradio' data-id='<%= id %>' data-scheduleId='<%= scheduleId %>' data-studentId='<%= studentId %>' data-active='<%= active %>' data-start='<%= start %>' data-end='<%= end %>' data-date='<%= date %>' data-comments='<%= comments %>'><p>Start Time: <%= start %></p><p>End Time: <%= end %> </p><p>Date: <%= date %></p><p>Comments: <%= comments %></p></label></div>");
    var newSlot = compiled({
      'start': startTime,
      'end': endTime,
      'date': dateTime,
      'comments': slot.comments,
      'id': slot.id,
      'scheduleId': slot.scheduleId,
      'active': slot.active,
      'studentId': slot.studentId
    });
    scheduleingPageSlots.append(newSlot);

    if (!slot.active) {
      if (slot.studentId === getCookie('socketid')) {
        googleDateTime = parseGoogleDateTime(slot);
        $("input[data-id='" + slot.id +"']").parent().parent().addClass('label-green');
        $("input[data-id='" + slot.id +"']").parent().append("<button class='btn btn-danger' id='cancel' data-id='" + slot.id + "' data-scheduleId='" + slot.scheduleId + "'>Cancel Reservation</button>");
        $("input[data-id='" + slot.id +"']").parent().append("<a id='save' class='btn btn-primary' target='_blank' href='https://calendar.google.com/calendar/render?action=TEMPLATE&text=Appointment&dates=" + googleDateTime + "&details=" + slot.comments + "&=true&output=xml#eventpage_6'>Save To Google Calendar</a>");
      } else {
        $("input[data-id='" + slot.id +"']").parent().parent().addClass('label-grey');
      }
    }
  });
}

function parseGoogleDateTime(slot) {
  var startTimeObject = moment(slot.startTime).utc();
  var endTimeObject = moment(slot.endTime).utc();
  var googleStartDay = startTimeObject.format("YYYYMMDD");
  var googleEndDay = endTimeObject.format("YYYYMMDD");
  var googleStartTime = startTimeObject.format("hhmmss");
  var googleEndTime = endTimeObject.format("hhmmss");
  var googleDateTime = googleStartDay + "T" + googleStartTime + "Z/" + googleEndDay + "T" + googleEndTime + "Z";
  return googleDateTime;
}

function makeAdminSlots (data) {
  var timezone = jstz.determine().name();
  data.targetSchedule.timeSlots.forEach(function (slot) {
    var offset = moment().format('ZZ');
    var startTime = moment(slot.startTime).utcOffset(offset).format("h:mm A") + " " + timezone;
    var endTime = moment(slot.endTime).utcOffset(offset).format("h:mm A") + " " + timezone;
    var dateTime = moment(slot.date).utcOffset(offset).format("MM/DD/YYYY");
    var compiled = _.template("<div id='slot' data-id='<%= id %>' data-scheduleId='<%= scheduleId %>' data-active='<%= active %>' data-start='<%= start %>' data-end='<%= end %>' data-date='<%= date %>' data-comments='<%= comments %>'><p>Start Time: <%= start %></p><p>End Time: <%= end %> </p><p>Date: <%= date %></p><p>Comments: <%= comments %></p></label></div>");
    var newSlot = compiled({
      'start': startTime,
      'end': endTime,
      'date': dateTime,
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

function checkNameField() {
  if (username.val() === "") {
    alert("Please fill in name");
    return false;
  } else {
    return true;
  }
}
function sendSlot () {
  if (checkNameField()) {
    this.dataset.socketid = getCookie('socketid');
    socket.send('selectSlot', {dataset: this.dataset, username: username.val()});
  }
}

function setDatePicker() {
  $('#datetimepicker1').datetimepicker({ format: 'LT' });
  $('#datetimepicker2').datetimepicker({ format: 'LT' });
  $('#datetimepicker3').datetimepicker({ format: 'L' });
}

$('document').ready(function () {
  submit.on('click', postData);
  adminPageSlots.delegate('#delete', 'click', deleteSlot);
  scheduleingPageSlots.delegate('#cancel', 'click', cancelSlot);
  adminPageSlots.delegate('.radio-btn', 'click', sendSlot);
  scheduleingPageSlots.delegate('.radio-btn', 'click', sendSlot);
  makeScheduleSlots(schedule);
  makeAdminSlots(schedule);
  setDatePicker();
});
