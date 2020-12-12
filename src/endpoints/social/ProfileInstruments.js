class ProfileInstrumentsEndpoint {

  static async get({
    session,
    storage,
    profileId,
    limit = 50,
    nextCursor = null
  }) {

    const query = {
      limit
    };

    if (nextCursor !== null) {
      query['nextCursor'] = nextCursor;
    }

    const { payload } = await session.request({
      hostname: 'api-invest-gw.tinkoff.ru',
      path: '/social/v1/profile/' + profileId + '/instrument',
      method: 'GET',
      headers: Object.assign({}, session.user.getInvestingHeaders()),
      query: {
        sessionId: session.getSessionId(),
        deviceId: session.user.getDeviceId(),
        appVersion: session.user.getAppVersion(),
        appName: session.user.getAppName(),
        platform: session.user.getPlatform(),
        origin: session.user.getOrigin(),
        ccc: session.user.getCCC(),
        cpswc: session.user.getCPSWC(),
        ...query
      }
    });

    const result = payload['items'];

    // TODO: THIS IS A WA
    if (payload['hasNext']) {
      result.hasNext = () => { return true; }
      result.nextCursor = payload['nextCursor'];
      result.getNext = () => {
        return ProfileInstrumentsEndpoint.get({
          session,
          storage,
          profileId,
          limit,
          nextCursor: payload['nextCursor']
        });
      }
    } else {
      result.hasNext = () => { return false; }
    }

    return result;

  }

}

module.exports = ProfileInstrumentsEndpoint;
