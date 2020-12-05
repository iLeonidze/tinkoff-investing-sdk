const fs = require('fs');
const path = require('path');

const IDENTITY_DEFAULTS = {
  "appVersion": "4.15.3",
  "platform": "ios",
  "origin": "mobile,ib5,loyalty,platform",
  "investing": {
    "headers": {
      "Accept-Language": "ru"
    },
    "userAgent": "Investing/6282 CFNetwork/1206 Darwin/20.1.0"
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

  constructor(localId, data = null) {

    this.localId = localId;
    this.data = data;

    this.localFile = path.resolve(`${__dirname}/../data/users/${this.localId}.json`);
    this.loaded = false;

    if (this.data !== null) {
      this.verifyData();
      this.loaded = true;
    } else {
      this.load();
    }

  }

  load() {
    if (!fs.existsSync(this.localFile)) {
      throw new Error(`User "${this.localId}" not exists at "${this.localFile}"`)
    }
    try {
      this.data = JSON.parse(fs.readFileSync(this.localFile, 'utf8'));
    } catch (e) {
      throw new Error(`Failed to load user ${this.user}`, e)
    }
    this.verifyData();
    return this;
  }

  save() {
    // TODO: use lazy save
    try {
      fs.writeFileSync(this.localFile, JSON.stringify(this.data, null, 2));
    } catch (e) {
      throw new Error(`Failed to save user ${this.user}`, e)
    }
    return this;
  }

  verifyData() {

    if (typeof this.data['auth'] !== 'object')
      throw new Error('Data do not contain auth section')

    for (const key of [
      'sessionId',
      'deviceId',
      'pinHash',
      'fingerprint_change_date',
      'auth_type_set_date',
      'auth_type'
    ]) {
      if (typeof this.data.auth[key] !== 'string') {
        throw new Error(`Key "${key}" not exists in auth data section or incorrect`)
      }
    }

    return this;

  }

  static new({
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
      }
    })
  }

  getProfile() {
    // TODO: return Profile object instead of ID
    return this.data['profile'] || null;
  }

  setProfile(value) {
    this.data['profile'] = value;
    this.save();
    return this;
  }

  getSessionId() {
    return this.data.auth['sessionId'];
  }

  setSessionId(value) {
    this.data.auth['sessionId'] = value;
    this.save();
    return this;
  }

  getDeviceId() {
    return this.data.auth['deviceId'];
  }

  setDeviceId(value) {
    this.data.auth['deviceId'] = value;
    this.save();
    return this;
  }

  getPinHash() {
    return this.data.auth['pinHash'];
  }

  setPinHash(value) {
    this.data.auth['pinHash'] = value;
    this.save();
    return this;
  }

  getFingerprintChangeDate() {
    return this.data.auth['fingerprint_change_date'];
  }

  setFingerprintChangeDate(value) {
    this.data.auth['fingerprint_change_date'] = value;
    this.save();
    return this;
  }

  getAuthTypeSetDate() {
    return this.data.auth['auth_type_set_date'];
  }

  setAuthTypeSetDate(value) {
    this.data.auth['auth_type_set_date'] = value;
    this.save();
    return this;
  }

  getAuthType() {
    return this.data.auth['auth_type'];
  }

  setAuthType(value) {
    this.data.auth['auth_type'] = value;
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
    return this;
  }

  getInvestingUserAgent() {
    try {
      return this.data.identity['investing']['userAgent'];
    } catch {
      return IDENTITY_DEFAULTS['investing']['userAgent'];
    }
  }

  setInvestingUserAgent(value) {
    if (typeof this.data['identity'] !== 'object') {
      this.data['identity'] = {};
    }
    if (typeof this.data.identity['investing'] !== 'object') {
      this.data.identity['investing'] = {};
    }
    this.data.identity.investing['userAgent'] = value;
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
    return this;
  }



}

module.exports = TinkoffInvestingUser;
