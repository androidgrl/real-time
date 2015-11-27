const Slot = require('../lib/slot');
const assert = require('chai').assert;

describe('Slot', function() {
  it('exists', function() {
    var slot = new Slot();

    assert(slot);
  });

  it('has a unique id', function() {
    var slot1 = new Slot();
    var slot2 = new Slot();

    assert.notEqual(slot1.id, slot2.id);
  });

  it('it defaults to an active state', function() {
    var slot = new Slot();

    assert(slot.active);
  });
});
