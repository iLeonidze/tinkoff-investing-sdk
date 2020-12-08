const apiRequest = require('../../request.js');

function getBankConnectionProps(session) {

  const headers = Object.assign({}, session.user.getBankHeaders());

  const data = {
    'deviceId': session.user.getDeviceId(),
    'platform': session.user.getPlatform(),
    'appVersion': session.user.getAppVersion(),
    'origin': session.user.getOrigin(),
    'fingerprint_change_date': session.user.getFingerprintChangeDate(),
    'connectionType': session.user.getConnectionType(),
    'mobile_device_os': session.user.getMobileDeviceOS(),
    'mobile_device_os_version': session.user.getMobileDeviceOSVersion(),
    'mobile_device_model': session.user.getMobileDeviceModel(),
    'appName': session.user.getAppName(),
    'screen_height': session.user.getScreenHeight(),
    'screen_width': session.user.getScreenWidth(),
    'device_type': session.user.getDeviceType(),
    'advertising_id': session.user.getAdvertisingID(),
    'fingerprint': session.user.getFingerprint(),
    'screen_dpi': session.user.getScreenDPI(),
    'root_flag': session.user.getRootFlag(),
    'device_location_availability': session.user.getDeviceLocationAvailability()
  };

  const query = {
    'ccc': session.user.getCCC(),
    'cpswc': session.user.getCPSWC()
  };

  return { headers, data, query }

}

class SessionEndpoint {

  static async renew(session) {

    const { headers, data, query } = getBankConnectionProps(session);

    const { payload } = await apiRequest({
      hostname: 'api.tinkoff.ru',
      path: '/v1/auth/session',
      method: 'POST',
      headers,
      query,
      data
    });

    const oldSessionId = session.getSessionId();
    session.setSessionId(payload.sessionid);
    query['sessionid'] = session.getSessionId();

    await apiRequest({
      hostname: 'api.tinkoff.ru',
      path: '/v1/warmup_cache',
      method: 'POST',
      headers,
      query,
      data
    });

    const authResult = await apiRequest({
      hostname: 'api.tinkoff.ru',
      path: '/v1/auth/by/pin',
      method: 'POST',
      headers,
      query,
      data: {
        'pinHash': session.user.getPinHash(),
        oldSessionId,
        'auth_type_set_date': session.user.getAuthTypeSetDate(),
        'auth_type': session.user.getAuthType(),
        ...data
      }
    });

    session.user.data['lastAuthResult'] = authResult['payload'];
    session.user.data.meta['authed'] = new Date().getTime();
    session.user.setUpdated({ updateMeta: false, updateIndexes: false });

  }

  static async ping(session) {

    const { headers, data, query } = getBankConnectionProps(session);

    const result = await apiRequest({
      hostname: 'api.tinkoff.ru',
      path: '/v1/ping',
      method: 'POST',
      headers,
      query,
      data
    });

    session.user.data.meta['pinged'] = new Date().getTime();
    session.user.setUpdated({ updateMeta: false, updateIndexes: false });

    // TODO: return equals ok?

  }

}

module.exports = SessionEndpoint;
