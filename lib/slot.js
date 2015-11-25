const crypto = require('crypto');

function generateHash() {
  return crypto.randomBytes(20).toString('hex');
}

function Slot() {
  this.id = generateHash();
  this.startTime = null;
  this.endTime = null;
  this.date = null;
  this.comments = null;
  this.active = true;
  this.scheduleId = null;
  this.studentId = null;
}

module.exports = Slot;
