module.exports = {

  new: async function({ api = this }) {

    const headers = {
      'Accept': api.user.identity.bank.headers['Accept'],
      'User-Agent': api.user.identity.bank.headers['User-Agent'],
      'Accept-Language': api.user.identity.bank.headers['Accept-Language']
    }

    const data = {
      'deviceId': api.user.auth['deviceId'],
      'platform': api.user.identity['platform'],
      'appVersion': api.user.identity['appVersion'],
      'origin': api.user.identity['origin'],
      'fingerprint_change_date': api.user.auth['fingerprint_change_date'],
      'connectionType': api.user.identity.bank['connectionType'],
      'mobile_device_os': api.user.identity.bank['mobile_device_os'],
      'mobile_device_os_version': api.user.identity.bank['mobile_device_os_version'],
      'mobile_device_model': api.user.identity.bank['mobile_device_model'],
      'appName': api.user.identity.bank['appName'],
      'screen_height': api.user.identity.bank['screen_height'],
      'screen_width': api.user.identity.bank['screen_width'],
      'device_type': api.user.identity.bank['device_type'],
      'advertising_id': api.user.identity.bank['advertising_id'],
      'fingerprint': api.user.identity.bank['fingerprint'],
      'screen_dpi': api.user.identity.bank['screen_dpi'],
      'root_flag': api.user.identity.bank['root_flag'],
      'device_location_availability': api.user.identity.bank['device_location_availability']
    }

    const { payload } = await api.request({
      hostname: 'api.tinkoff.ru',
      path: '/v1/auth/session',
      method: 'POST',
      headers,
      query: {
        'ccc': api.user.identity['ccc'],
        'cpswc': api.user.identity['cpswc']
      },
      data
    });

    const oldSessionId = api.user.getSessionId();
    api.user.setSessionId(payload.sessionid);

    await api.request({
      hostname: 'api.tinkoff.ru',
      path: '/v1/warmup_cache',
      method: 'POST',
      headers,
      query: {
        'ccc': api.user.identity['ccc'],
        'cpswc': api.user.identity['cpswc'],
        'sessionid': api.user.auth['sessionId']
      },
      data
    });

    const result3 = await api.request({
      hostname: 'api.tinkoff.ru',
      path: '/v1/auth/by/pin',
      method: 'POST',
      headers,
      query: {
        'ccc': api.user.identity['ccc'],
        'cpswc': api.user.identity['cpswc'],
        'sessionid': api.user.auth['sessionId']
      },
      data: {
        oldSessionId,
        'auth_type_set_date': api.user.auth['auth_type_set_date'],
        'auth_type': api.user.auth['auth_type'],
        'pinHash': api.user.auth['pinHash'],
        ...data
      }
    });
    console.log(result3)

  },

  ping: async function({ api = this }) {

    const result = await api.request({
      hostname: 'api.tinkoff.ru',
      path: '/v1/ping',
      method: 'POST',
      headers: {
        'Accept': api.user.identity.bank.headers['Accept'],
        'User-Agent': api.user.identity.bank.headers['User-Agent'],
        'Accept-Language': api.user.identity.bank.headers['Accept-Language']
      },
      query: {
        'ccc': api.user.identity['ccc'],
        'cpswc': api.user.identity['cpswc'],
        'sessionid': api.user.auth['sessionId']
      },
      data: {
        'deviceId': api.user.auth['deviceId'],
        'platform': api.user.identity['platform'],
        'appVersion': api.user.identity['appVersion'],
        'origin': api.user.identity['origin'],
        'fingerprint_change_date': api.user.auth['fingerprint_change_date'],
        'connectionType': api.user.identity.bank['connectionType'],
        'mobile_device_os': api.user.identity.bank['mobile_device_os'],
        'mobile_device_os_version': api.user.identity.bank['mobile_device_os_version'],
        'mobile_device_model': api.user.identity.bank['mobile_device_model'],
        'appName': api.user.identity.bank['appName'],
        'screen_height': api.user.identity.bank['screen_height'],
        'screen_width': api.user.identity.bank['screen_width'],
        'device_type': api.user.identity.bank['device_type'],
        'advertising_id': api.user.identity.bank['advertising_id'],
        'fingerprint': api.user.identity.bank['fingerprint'],
        'screen_dpi': api.user.identity.bank['screen_dpi'],
        'root_flag': api.user.identity.bank['root_flag'],
        'device_location_availability': api.user.identity.bank['device_location_availability']
      }
    });

    console.log(result);

  }
}
