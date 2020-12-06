const TinkoffInvestingUsers = require('./TinkoffInvestingUsers.js');
const Profiles = require('./objects/Profiles.js');

class TinkoffInvestingStorage {
  constructor() {
    this.globalContext = {};
    this.users = new TinkoffInvestingUsers();
    this.profiles = new Profiles();
  }
}


module.exports = TinkoffInvestingStorage;
