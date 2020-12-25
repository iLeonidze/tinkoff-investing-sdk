const fs = require('fs');
const path = require('path');

const TinkoffInvestingUsers = require('./TinkoffInvestingUsers.js');
const Profiles = require('./objects/Profiles.js');
const Operations = require('./objects/Operations.js');

class TinkoffInvestingStorage {

  constructor({ useFS = true, fsLocation = './data/' }) {

    this.fsLocation = useFS ? path.resolve(fsLocation) : null;
    if (useFS && !fs.existsSync(this.fsLocation)) {
      fs.mkdirSync(this.fsLocation);
    }

    this.globalContext = {};

    this.operations = new Operations({
      storage: this
    });

    this.users = new TinkoffInvestingUsers({
      storage: this,
      fsLocation: useFS ? path.join(this.fsLocation, 'users') : null
    });

    this.profiles = new Profiles({
      storage: this,
      fsLocation: useFS ? path.join(this.fsLocation, 'profiles') : null
    });

  }

}

module.exports = TinkoffInvestingStorage;
