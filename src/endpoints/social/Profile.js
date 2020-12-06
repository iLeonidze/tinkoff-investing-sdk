const apiRequest = require('../../request.js');

class ProfileEndpoint {

	static async get({
		session,
		storage,
		profileId = null
	}) {

		const { payload } = await apiRequest({
			hostname: 'api-invest-gw.tinkoff.ru',
			path: '/social/v1/profile/' + (profileId ? `${profileId}/` : ''),
			method: 'GET',
			headers: Object.assign({}, session.user.getInvestingHeaders()),
			query: {
				sessionId: session.getSessionId(),
				deviceId: session.user.getDeviceId(),
				appVersion: session.user.getAppVersion(),
				platform: session.user.getPlatform(),
				origin: session.user.getOrigin(),
				ccc: session.user.getCCC(),
				cpswc: session.user.getCPSWC()
			}
		});

		return storage.profiles.createOrUpdateProfile({ profileId, data: payload });

	}

}

module.exports = ProfileEndpoint;
