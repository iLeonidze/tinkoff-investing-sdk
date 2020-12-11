const request = require('./request.js');
const sleep = require('../utils/sleep.js');
const TinkoffInvestingUser = require('./TinkoffInvestingUser.js');

const SessionEndpoint = require("./endpoints/auth/Session.js");

class TinkoffInvestingUserSession {

  constructor(user) {

    if (!(user instanceof TinkoffInvestingUser))
      throw new Error('Invalid user')

    this.user = user;
    this.timer = null;
    // this.cooldown = 1100;
    this.cooldown = 500;

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

  async request(options) {
    if (typeof options['ignoreCooldown'] !== 'boolean' || !options['ignoreCooldown']) {
      const lastConnected = this.user.getConnected();
      const nextConnect = lastConnected + this.cooldown;
      const currentConnect = new Date().getTime();
      if (nextConnect > currentConnect) {
        await sleep(nextConnect - currentConnect, 10);
      }
    }
    if (typeof options['ignoreCooldown'] !== 'undefined') {
      delete options['ignoreCooldown'];
    }
    this.user.updateConnected();
    return await request(options);
  }

}

module.exports = TinkoffInvestingUserSession;
