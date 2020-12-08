const TinkoffInvestingUser = require('./TinkoffInvestingUser.js');

const SessionEndpoint = require("./endpoints/auth/Session.js");

class TinkoffInvestingUserSession {

  constructor(user) {

    if (!(user instanceof TinkoffInvestingUser))
      throw new Error('Invalid user')

    this.user = user;
    this.timer = null;

  }

  isStarted() {
    return this.timer !== null;
  }

  async start() {
    if (this.isStarted()) return false;
    await SessionEndpoint.renew(this);
    const session = this;
    this.timer = setInterval(function() {
      SessionEndpoint.ping(session).then(res => {
        // ?
      }).catch(e => {
        console.error('Failed to ping session', e)
      });
    }, 20000);
    return true;
  }

  stop() {
    if (!this.isStarted()) return false;
    clearInterval(this.timer);
    this.timer = null;
    this.user.save();
    return true;
  }

  getSessionId() {
    return this.user.getSessionId();
  }

  setSessionId(value) {
    return this.user.setSessionId(value);
  }

}

module.exports = TinkoffInvestingUserSession;
