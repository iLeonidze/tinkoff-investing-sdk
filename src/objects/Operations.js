const Operation = require('./Operation.js');

class Operations {

  constructor({ storage }) {
    this.storage = storage;
    this.data = {};
  }

  getOperationsByInstrument({
    classCode,
    ticker,
    dateFrom = null,
    dateTo = null,
    profileId = null
  }) {

  }

  resetTickerForUser({
    classCode,
    ticker,
    profileId
  }) {
    if (typeof this.data[classCode] === 'undefined'
      || typeof this.data[classCode][ticker] === 'undefined'
      || typeof this.data[classCode][ticker][profileId] === 'undefined') return;
    delete this.data[classCode][ticker][profileId];
  }

  newOperation({
    profileId,
    classCode,
    ticker,
    stamp,
    action,
    price
  }) {
    return new Operation({
      profileId,
      classCode,
      ticker,
      stamp,
      action,
      price,
      storage: this.storage
    });
  }



}

module.exports = Operations;
