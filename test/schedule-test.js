const Schedule = require('../lib/schedule');
const assert = require('chai').assert;

describe('Schedule', function() {
  it('exists', function() {
    var sched = new Schedule();

    assert(sched);
  });

  it('has a unique id', function() {
    var sched1 = new Schedule();
    var sched2 = new Schedule();

    assert.notEqual(sched1.id, sched2.id);
  });

  it('has a unique scheduleing page id', function() {
    var sched1 = new Schedule();
    var sched2 = new Schedule();

    assert.notEqual(sched1.id, sched2.id);
  });

  it('has a scheduling page url', function() {
    var sched = new Schedule();
    var url = sched.schedulingPageUrl;
    var id = sched.schedulingPageId;

    assert.equal(`/scheduling-page/${id}`, url);
  });

  it('has a timeSlots array', function() {
    var sched = new Schedule();
    var timeSlots = sched.timeSlots;

    assert.deepEqual([], timeSlots);
  });
});
