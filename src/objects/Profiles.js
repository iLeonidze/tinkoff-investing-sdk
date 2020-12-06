const fs = require('fs');
const path = require('path');

const Profile = require('./Profile.js');

class Profiles {

  constructor({ storage, fsLocation }) {

    this.storage = storage;
    this.fsLocation = fsLocation;

    if (this.fsLocation && !fs.existsSync(this.fsLocation)) {
      fs.mkdirSync(this.fsLocation);
    }

    this.profilesById = {};

  }

  isProfileInMemory(profileId) {
    return typeof this.profilesById[profileId] !== 'undefined';
  }

  getProfile(profile) {
    let profileId;
    if (profile instanceof Profile) {
      profileId = profile.profileId;
    } else {
      profileId = profile;
    }
    if (typeof profileId === 'undefined') {
      throw new Error('Profile ID is not set')
    }
    if (this.isProfileInMemory(profileId)) {
      return this.profilesById[profileId];
    }
    return this.loadProfile(profileId);
  }

  loadProfile(profileId) {
    if (this.isProfileInMemory()) return this.getProfile(profileId);
    const profile = new Profile({
      profileId,
      storage: this.storage,
      fsLocation: this.getFsLocationForProfile(profileId)
    });
    this.profilesById[profileId] = profile;
    this.updateIndexesForProfile(profile);
    return profile;
  }

  unloadProfile(profile) {
    const realProfile = this.getProfile(profile);

    // TODO

    delete this.profilesById[realProfile.profileId];
  }

  updateIndexesForProfile(profile) {
    const realProfile = this.getProfile(profile);

    // TODO

  }

  getFsLocationForProfile(profileId) {
    return this.fsLocation ? path.join(this.fsLocation, `${profileId}.json`) : null;
  }

  newProfile({
    profileId,
    data
  }) {
    if (typeof data['id'] === 'string') {
      profileId = data['id'];
      delete data['id'];
      data = {
        raw: data
      };
    } else {
      throw new Error('Profile ID is not set')
    }
    return new Profile({
      profileId,
      data,
      storage: this.storage,
      fsLocation: this.getFsLocationForUser(localId)
    })
  }

  createOrUpdateProfile({
    profileId,
    data
  }) {
    if (typeof data['id'] === 'string') {
      profileId = data['id'];
      delete data['id'];
      data = {
        raw: data
      };
    } else {
      throw new Error('Profile ID is not set')
    }
    const profile = this.getProfile(profileId);
    if (profile) {
      return profile.update(data);
    } else {
      return this.newProfile({
        profileId,
        data
      });
    }
  }


}

module.exports = Profiles;
