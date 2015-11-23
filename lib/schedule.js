const crypto = require('crypto');

function generateHash() {
  return crypto.randomBytes(20).toString('hex');
}

function Schedule() {
  this.id = generateHash();
  this.schedulingPageUrl = '/scheduling-page/' + generateHash();
  this.timeSlots = [];
}

module.exports = Schedule;
