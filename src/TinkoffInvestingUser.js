const fs = require('fs');

const merge = require('../merge.js');

const SAVE_DELAY = 1000;

const IDENTITY_DEFAULTS = {
  "appVersion": "4.15.3",
  "platform": "ios",
  "origin": "mobile,ib5,loyalty,platform",
  "investing": {
    "headers": {
      "Accept": "*/*",
      "User-Agent": "Investing/6282 CFNetwork/1206 Darwin/20.1.0",
      "Accept-Language": "ru"
    }
  },
  "bank": {
    "headers": {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent": "iPad/iOS(14.2)/investing/4.15.3(6282)",
      "Accept-Language": "ru"
    },
    "connectionType": "WiFi",
    "mobile_device_os": "iOS",
    "mobile_device_os_version": "14.2",
    "mobile_device_model": "iPad8,3",
    "appName": "investing",
    "screen_height": 2388,
    "screen_width": 1668,
    "device_type": "tablet",
    "advertising_id": "00000000-0000-0000-0000-000000000000",
    "fingerprint": "iPad/iOS(14.2)/investing/4.15.3(6282)###2388x1668x32###-180###false###false###",
    "screen_dpi": 2,
    "root_flag": false,
    "device_location_availability": "unknown"
  }
}

class TinkoffInvestingUser {

  constructor({
    localId,
    data = null,
    storage = null,
    fsLocation = null
  }) {

    if (typeof localId === 'undefined')
      throw new Error('User ID not set');

    this.localId = localId;
    this.data = data;
    this.storage = storage;
    this.fsLocation = fsLocation;

    this.loaded = false;
    this.saved = false;
    this.updating = false;
    this.unloaded = true;

    if (this.storage) {
      if (this.storage.users.isUserInMemory(this.localId))
        throw new Error(`User "${this.localId}" already in memory`);
      this.storage.users.usersById[this.localId] = this;
    }

    if (this.data !== null) {
      this.verifyData();
      this.loaded = true;
      this.unloaded = false;
      setUpdated({});
    } else {
      this.tryReload();
    }

    if (this.data == null)
      this.data = {};

    if (typeof this.data['meta'] !== 'object')
      this.data['meta'] = {};

    if (typeof this.data.meta['created'] !== 'number')
      this.data.meta['created'] = new Date().getTime();

    if (typeof this.data.meta['connected'] !== 'number')
      this.data.meta['connected'] = 0;

  }

  tryReload() {
    if (fs.existsSync(this.fsLocation)) {
      return this.reload();
    }
    return this;
  }

  reload() {
    if (!this.fsLocation) {
      throw new Error(`Not possible to reload user "${this.localId}" with FS usage disabled`)
    }
    if (!fs.existsSync(this.fsLocation)) {
      throw new Error(`User "${this.localId}" not exists at "${this.fsLocation}"`)
    }
    let data;
    try {
      data = JSON.parse(fs.readFileSync(this.fsLocation, 'utf8'));
    } catch (e) {
      throw new Error(`Failed to load user "${this.localId}"`, e)
    }
    this.verifyData(data);
    this.data = data;
    this.saved = true;
    this.loaded = true;
    this.unloaded = false;
    this.updateIndexes();
    return this;
  }

  unload() {
    if (!this.loaded) return;
    this.storage.users.unloadUser(this);
    this.data = {};
    this.loaded = false;
  }

  updateIndexes() {
    if (this.storage && this.storage.users.isUserInMemory(this)) {
      this.storage.users.updateIndexesForUser(this);
    }
    return this;
  }

  save() {
    if (this.unloaded || !this.fsLocation) return this;
    try {
      fs.writeFileSync(this.fsLocation, JSON.stringify(this.data, null, 2));
    } catch (e) {
      throw new Error(`Failed to save user ${this.localId}`, e)
    }
    this.saved = true;
    return this;
  }

  delete() {
    this.unload();
    if (this.fsLocation) {
      try {
        fs.unlinkSync(this.fsLocation);
      } catch (e) {
        throw new Error(`Failed to delete user ${this.localId}`, e)
      }
    }
    this.unloaded = true;
  }

  setUpdated({ updateMeta = true, updateIndexes = true }) {
    if (updateMeta) this.data.meta['updated'] = new Date().getTime();
    if (updateIndexes) this.updateIndexes();
    if (this.updating || !this.fsLocation) return this;
    this.updating = true;
    setTimeout(() => {
      this.updating = false;
      this.save();
    }, SAVE_DELAY);
  }

  update(data) {

    this.verifyData(data);
    merge(this.data, data);

    this.loaded = true;
    this.unloaded = false;
    this.setUpdated({});

    return this;

  }

  verifyData(data) {

    if (!data)
      data = this.data;

    if (typeof data['auth'] !== 'object')
      throw new Error('Data do not contain auth section')

    for (const key of [
      'sessionId',
      'deviceId',
      'pinHash',
      'fingerprint_change_date',
      'auth_type_set_date',
      'auth_type'
    ]) {
      if (typeof data.auth[key] !== 'string') {
        throw new Error(`Key "${key}" not exists in auth data section or incorrect`)
      }
    }

    return this;

  }

  updateConnected() {
    this.data.meta['connected'] = new Date().getTime();
    this.setUpdated({ updateMeta: false, updateIndexes: false });
  }

  getConnected() {
    return this.data.meta['connected'];
  }

  isSaved() {
    return !!this.saved;
  }

  getProfile() {
    return this.storage.profiles.getProfile(this.getProfileId());
  }

  setProfile(profile) {
    this.setProfileId(profile.profileId);
    return this;
  }

  getProfileId() {
    return this.data['profileId'] || null;
  }

  setProfileId(value) {
    this.data['profileId'] = value;
    this.setUpdated({});
    return this;
  }

  hasProfileId() {
    return this.getProfileId() !== null;
  }

  getSessionId() {
    return this.data.auth['sessionId'];
  }

  setSessionId(value) {
    this.data.auth['sessionId'] = value;
    this.setUpdated({ updateMeta: false });
    return this;
  }

  getDeviceId() {
    return this.data.auth['deviceId'];
  }

  setDeviceId(value) {
    this.data.auth['deviceId'] = value;
    this.setUpdated({});
    return this;
  }

  getPinHash() {
    return this.data.auth['pinHash'];
  }

  setPinHash(value) {
    this.data.auth['pinHash'] = value;
    this.setUpdated({});
    return this;
  }

  getFingerprintChangeDate() {
    return this.data.auth['fingerprint_change_date'];
  }

  setFingerprintChangeDate(value) {
    this.data.auth['fingerprint_change_date'] = value;
    this.setUpdated({});
    return this;
  }

  getAuthTypeSetDate() {
    return this.data.auth['auth_type_set_date'];
  }

  setAuthTypeSetDate(value) {
    this.data.auth['auth_type_set_date'] = value;
    this.setUpdated({});
    return this;
  }

  getAuthType() {
    return this.data.auth['auth_type'];
  }

  setAuthType(value) {
    this.data.auth['auth_type'] = value;
    this.setUpdated({});
    return this;
  }

  getCCC() {
    try {
      return this.data.identity['ccc'];
    } catch {
      return IDENTITY_DEFAULTS['ccc'];
    }
  }

  setCCC(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    this.data.identity['ccc'] = !!value;
    this.setUpdated({});
    return this;
  }

  getCPSWC() {
    try {
      return this.data.identity['cpswc'];
    } catch {
      return IDENTITY_DEFAULTS['cpswc'];
    }
  }

  setCPSWC(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    this.data.identity['cpswc'] = !!value;
    this.setUpdated({});
    return this;
  }

  getAppVersion() {
    try {
      return this.data.identity['appVersion'];
    } catch {
      return IDENTITY_DEFAULTS['appVersion'];
    }
  }

  setAppVersion(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    this.data.identity['appVersion'] = value;
    this.setUpdated({});
    return this;
  }

  getPlatform() {
    try {
      return this.data.identity['platform'];
    } catch {
      return IDENTITY_DEFAULTS['platform'];
    }
  }

  setPlatform(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    this.data.identity['platform'] = value;
    this.setUpdated({});
    return this;
  }

  getOrigin() {
    try {
      return this.data.identity['origin'];
    } catch {
      return IDENTITY_DEFAULTS['origin'];
    }
  }

  setOrigin(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    this.data.identity['origin'] = value;
    this.setUpdated({});
    return this;
  }

  getInvestingHeaders() {
    try {
      return this.data.identity['investing']['headers'];
    } catch {
      return IDENTITY_DEFAULTS['investing']['headers'];
    }
  }

  setInvestingHeaders(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    if (typeof this.data.identity['investing'] !== 'object') {
      this.data.identity['investing'] = {};
    }
    this.data.identity.investing['headers'] = value;
    this.setUpdated({});
    return this;
  }

  getBankHeaders() {
    try {
      return this.data.identity['bank']['headers'];
    } catch {
      return IDENTITY_DEFAULTS['bank']['headers'];
    }
  }

  setBankHeaders(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    if (typeof this.data.identity['bank'] !== 'object') {
      this.data.identity['bank'] = {};
    }
    this.data.identity.bank['headers'] = value;
    this.setUpdated({});
    return this;
  }

  getConnectionType() {
    try {
      return this.data.identity['bank']['connectionType'];
    } catch {
      return IDENTITY_DEFAULTS['bank']['connectionType'];
    }
  }

  setConnectionType(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    if (typeof this.data.identity['bank'] !== 'object') {
      this.data.identity['bank'] = {};
    }
    this.data.identity.bank['connectionType'] = value;
    this.setUpdated({});
    return this;
  }

  getMobileDeviceOS() {
    try {
      return this.data.identity['bank']['mobile_device_os'];
    } catch {
      return IDENTITY_DEFAULTS['bank']['mobile_device_os'];
    }
  }

  setMobileDeviceOS(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    if (typeof this.data.identity['bank'] !== 'object') {
      this.data.identity['bank'] = {};
    }
    this.data.identity.bank['mobile_device_os'] = value;
    this.setUpdated({});
    return this;
  }

  getMobileDeviceOSVersion() {
    try {
      return this.data.identity['bank']['mobile_device_os_version'];
    } catch {
      return IDENTITY_DEFAULTS['bank']['mobile_device_os_version'];
    }
  }

  setMobileDeviceOSVersion(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    if (typeof this.data.identity['bank'] !== 'object') {
      this.data.identity['bank'] = {};
    }
    this.data.identity.bank['mobile_device_os_version'] = value;
    this.setUpdated({});
    return this;
  }

  getMobileDeviceModel() {
    try {
      return this.data.identity['bank']['mobile_device_model'];
    } catch {
      return IDENTITY_DEFAULTS['bank']['mobile_device_model'];
    }
  }

  setMobileDeviceModel(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    if (typeof this.data.identity['bank'] !== 'object') {
      this.data.identity['bank'] = {};
    }
    this.data.identity.bank['mobile_device_model'] = value;
    this.setUpdated({});
    return this;
  }

  getAppName() {
    try {
      return this.data.identity['bank']['appName'];
    } catch {
      return IDENTITY_DEFAULTS['bank']['appName'];
    }
  }

  setAppName(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    if (typeof this.data.identity['bank'] !== 'object') {
      this.data.identity['bank'] = {};
    }
    this.data.identity.bank['appName'] = value;
    this.setUpdated({});
    return this;
  }

  getScreenHeight() {
    try {
      return this.data.identity['bank']['screen_height'];
    } catch {
      return IDENTITY_DEFAULTS['bank']['screen_height'];
    }
  }

  setScreenHeight(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    if (typeof this.data.identity['bank'] !== 'object') {
      this.data.identity['bank'] = {};
    }
    this.data.identity.bank['screen_height'] = value;
    this.setUpdated({});
    return this;
  }

  getScreenWidth() {
    try {
      return this.data.identity['bank']['screen_width'];
    } catch {
      return IDENTITY_DEFAULTS['bank']['screen_width'];
    }
  }

  setScreenWidth(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    if (typeof this.data.identity['bank'] !== 'object') {
      this.data.identity['bank'] = {};
    }
    this.data.identity.bank['screen_width'] = value;
    this.setUpdated({});
    return this;
  }

  getDeviceType() {
    try {
      return this.data.identity['bank']['device_type'];
    } catch {
      return IDENTITY_DEFAULTS['bank']['device_type'];
    }
  }

  setDeviceType(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    if (typeof this.data.identity['bank'] !== 'object') {
      this.data.identity['bank'] = {};
    }
    this.data.identity.bank['device_type'] = value;
    this.setUpdated({});
    return this;
  }

  getAdvertisingID() {
    try {
      return this.data.identity['bank']['advertising_id'];
    } catch {
      return IDENTITY_DEFAULTS['bank']['advertising_id'];
    }
  }

  setAdvertisingID(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    if (typeof this.data.identity['bank'] !== 'object') {
      this.data.identity['bank'] = {};
    }
    this.data.identity.bank['advertising_id'] = value;
    this.setUpdated({});
    return this;
  }

  getFingerprint() {
    try {
      return this.data.identity['bank']['fingerprint'];
    } catch {
      return IDENTITY_DEFAULTS['bank']['fingerprint'];
    }
  }

  setFingerprint(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    if (typeof this.data.identity['bank'] !== 'object') {
      this.data.identity['bank'] = {};
    }
    this.data.identity.bank['fingerprint'] = value;
    this.setUpdated({});
    return this;
  }

  getScreenDPI() {
    try {
      return this.data.identity['bank']['screen_dpi'];
    } catch {
      return IDENTITY_DEFAULTS['bank']['screen_dpi'];
    }
  }

  setScreenDPI(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    if (typeof this.data.identity['bank'] !== 'object') {
      this.data.identity['bank'] = {};
    }
    this.data.identity.bank['screen_dpi'] = value;
    this.setUpdated({});
    return this;
  }

  getRootFlag() {
    try {
      return this.data.identity['bank']['root_flag'];
    } catch {
      return IDENTITY_DEFAULTS['bank']['root_flag'];
    }
  }

  setRootFlag(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    if (typeof this.data.identity['bank'] !== 'object') {
      this.data.identity['bank'] = {};
    }
    this.data.identity.bank['root_flag'] = value;
    this.setUpdated({});
    return this;
  }

  getDeviceLocationAvailability() {
    try {
      return this.data.identity['bank']['device_location_availability'];
    } catch {
      return IDENTITY_DEFAULTS['bank']['device_location_availability'];
    }
  }

  setDeviceLocationAvailability(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    if (typeof this.data.identity['bank'] !== 'object') {
      this.data.identity['bank'] = {};
    }
    this.data.identity.bank['device_location_availability'] = value;
    this.setUpdated({});
    return this;
  }



}

module.exports = TinkoffInvestingUser;
