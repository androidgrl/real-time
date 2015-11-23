const crypto = require('crypto');

function generateHash() {
  return crypto.randomBytes(20).toString('hex');
}

function Schedule() {
  this.id = generateHash();
  this.schedulingPageId = generateHash();
  this.schedulingPageUrl = '/scheduling-page/' + this.schedulingPageId;
  this.timeSlots = [];
}

module.exports = Schedule;
