const fs = require('fs');
const path = require('path');

const TinkoffInvestingUser = require('./TinkoffInvestingUser.js');

class TinkoffInvestingUsers {

  constructor({ storage, fsLocation }) {

    this.storage = storage;
    this.fsLocation = fsLocation;

    if (this.fsLocation && !fs.existsSync(this.fsLocation)) {
      fs.mkdirSync(this.fsLocation);
    }

    this.usersById = {}
    this.usersByProfileId = {};

  }

  isUserInMemory(localId) {
    return typeof this.usersById[localId] !== 'undefined';
  }

  getUser(user) {
    let localId;
    if (user instanceof TinkoffInvestingUser) {
      localId = user.localId;
    } else {
      localId = user;
    }
    if (typeof localId === 'undefined') {
      throw new Error('Local ID is not set')
    }
    if (this.isUserInMemory(localId)) {
      return this.usersById[localId];
    }
    return this.loadUser(localId);
  }

  loadUser(localId) {
    if (this.isUserInMemory()) return this.getUser(localId);
    const user = new TinkoffInvestingUser({
      localId,
      storage: this.storage,
      fsLocation: this.getFsLocationForUser(localId)
    });
    this.usersById[localId] = user;
    this.updateIndexesForUser(user);
    return user;
  }

  unloadUser(user) {
    const realUser = this.getUser(user);

    if (realUser.hasProfileId()) {
      const profileId = realUser.getProfileId();
      delete this.usersByProfileId[profileId];
    }

    delete this.usersById[realUser.localId];
  }

  updateIndexesForUser(user) {
    const realUser = this.getUser(user);

    if (realUser.hasProfileId()) {
      const profileId = realUser.getProfileId();
      this.usersByProfileId[profileId] = realUser;
    }

  }

  getFsLocationForUser(localId) {
    return this.fsLocation ? path.join(this.fsLocation, `${localId}.json`) : null;
  }

  newUser({
    localId,
    sessionId,
    deviceId,
    pinHash,
    fingerprint_change_date,
    auth_type_set_date,
    auth_type
  }) {
    return new TinkoffInvestingUser({
      localId,
      data: {
        auth: {
          sessionId,
          deviceId,
          pinHash,
          fingerprint_change_date,
          auth_type_set_date,
          auth_type
        }
      },
      storage: this.storage,
      fsLocation: this.getFsLocationForUser(localId)
    });
  }

  createOrUpdateUser({
    localId,
    sessionId,
    deviceId,
    pinHash,
    fingerprint_change_date,
    auth_type_set_date,
    auth_type
  }) {
    const user = this.getUser(localId);
    if (user) {
      return user.update({
        auth: {
          sessionId,
          deviceId,
          pinHash,
          fingerprint_change_date,
          auth_type_set_date,
          auth_type
        }
      });
    } else {
      return this.newUser({
        localId,
        sessionId,
        deviceId,
        pinHash,
        fingerprint_change_date,
        auth_type_set_date,
        auth_type
      });
    }
  }

}

module.exports = TinkoffInvestingUsers;
