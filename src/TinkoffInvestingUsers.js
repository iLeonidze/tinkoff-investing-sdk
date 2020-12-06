const TinkoffInvestingUser = require('./TinkoffInvestingUser.js');

class TinkoffInvestingUsers {

  constructor(storage) {
    this.storage = storage;
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
    const user = new TinkoffInvestingUser(localId, null, this.storage).reload();
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
      storage: this.storage
    })
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
        data: {
          auth: {
            sessionId,
            deviceId,
            pinHash,
            fingerprint_change_date,
            auth_type_set_date,
            auth_type
          }
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
      }).save();
    }
  }

}

module.exports = TinkoffInvestingUsers;
