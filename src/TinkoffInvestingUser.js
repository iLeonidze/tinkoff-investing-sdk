const fs = require('fs');
const path = require('path');

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

  constructor(localId, data = null, storage = null) {

    this.localId = localId;
    this.data = data;
    this.storage = storage;

    this.localFile = path.resolve(`${__dirname}/../data/users/${this.localId}.json`);
    this.loaded = false;
    this.saved = false;
    this.updating = false;
    this.unloaded = true;

    if (this.data !== null) {
      this.verifyData();
      this.loaded = true;
      this.unloaded = false;
    } else {
      this.reload();
    }

    if (typeof this.data['meta'] !== 'object')
      this.data['meta'] = {};

    if (typeof this.data.meta['created'] !== 'number')
      this.data.meta['created'] = new Date().getTime();

  }

  reload() {
    if (!fs.existsSync(this.localFile)) {
      throw new Error(`User "${this.localId}" not exists at "${this.localFile}"`)
    }
    let data;
    try {
      data = JSON.parse(fs.readFileSync(this.localFile, 'utf8'));
    } catch (e) {
      throw new Error(`Failed to load user ${this.user}`, e)
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
    if (this.unloaded) return this;
    try {
      fs.writeFileSync(this.localFile, JSON.stringify(this.data, null, 2));
    } catch (e) {
      throw new Error(`Failed to save user ${this.user}`, e)
    }
    this.saved = true;
    return this;
  }

  delete() {
    this.unload();
    try {
      fs.writeFileSync(this.localFile, JSON.stringify(this.data, null, 2));
    } catch (e) {
      throw new Error(`Failed to delete user ${this.user}`, e)
    }
    this.unloaded = true;
  }

  setUpdated({ updateMeta = true, updateIndexes = true }) {
    if (updateMeta) this.data.meta['updated'] = new Date().getTime();
    if (updateIndexes) this.updateIndexes();
    if (this.updating) return this;
    this.updating = true;
    setTimeout(() => {
      this.updating = false;
      this.save();
    }, SAVE_DELAY);
  }

  update(data) {
    verifyData(data);
    merge(this.data, data);
    this.setUpdated();
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

  isSaved() {
    return !!this.saved;
  }

  getProfile() {
    // TODO: return Profile object instead of ID

  }

  setProfile() {
    // TODO: set ID from Profile

  }

  getProfileId() {
    return this.data['profileId'] || null;
  }

  setProfileId(value) {
    this.data['profileId'] = value;
    this.setUpdated();
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
    this.setUpdated();
    return this;
  }

  getPinHash() {
    return this.data.auth['pinHash'];
  }

  setPinHash(value) {
    this.data.auth['pinHash'] = value;
    this.setUpdated();
    return this;
  }

  getFingerprintChangeDate() {
    return this.data.auth['fingerprint_change_date'];
  }

  setFingerprintChangeDate(value) {
    this.data.auth['fingerprint_change_date'] = value;
    this.setUpdated();
    return this;
  }

  getAuthTypeSetDate() {
    return this.data.auth['auth_type_set_date'];
  }

  setAuthTypeSetDate(value) {
    this.data.auth['auth_type_set_date'] = value;
    this.setUpdated();
    return this;
  }

  getAuthType() {
    return this.data.auth['auth_type'];
  }

  setAuthType(value) {
    this.data.auth['auth_type'] = value;
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
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
    this.setUpdated();
    return this;
  }



}

module.exports = TinkoffInvestingUser;
