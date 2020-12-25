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
    this.cooldown = 410;
    this.underFail = null;
    this.underProlong = false;

  }

  isStarted() {
    return this.timer !== null;
  }

  async start() {
    if (this.isStarted()) return false;
    if (this.isSessionOutdated()) {
      console.log('Restarting session...')
      await SessionEndpoint.renew(this);
    } else {
      console.log('Resuming session...');
    }
    const session = this;
    this.timer = setInterval(function() {
      if (session.isSessionOutdated()) {
        console.log('Session is outdated, prolonging...');
        return session.prolongSession();
      }
      SessionEndpoint.ping(session).then(res => {
        // ?
      }).catch(e => {
        console.error('Failed to ping session', e)
      });
    }, 20000);
    return true;
  }

  isSessionOutdated() {
    // 8h
    return (new Date().getTime() - this.user.data.meta['authed']) > 28800000;
  }

  async prolongSession() {
    if (this.underProlong) return;
    this.underProlong = true;
    await this.stop();
    await this.start();
    this.underProlong = false;
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
    try {
      return await request(options);
    } catch (e) {
      console.error(`Request failed with error ${e.name}`);
      if (this.underFail == null) {
        if (e.name === 'InsufficientPrivileges') {
          this.underFail = 'expiredSession';
          console.log('Trying to update session...');
        }
      }
      throw e;
    }
  }

}

module.exports = TinkoffInvestingUserSession;
