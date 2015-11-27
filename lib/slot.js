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
  this.username = null;
}

Slot.prototype.updateSlotAttributes = function (req, slot) {
  slot.startTime = req.body.start;
  slot.endTime = req.body.end;
  slot.date = req.body.date;
  slot.comments = req.body.comments;
  slot.scheduleId = req.body.scheduleId;
  slot.username = req.body.username;
};

module.exports = Slot;
