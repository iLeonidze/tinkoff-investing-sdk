const apiRequest = require('../../request.js')

const Profile = require("../../objects/Profile.js");

class ProfileEndpoint {

	static async get(session, { id = null }) {

		let path = '/social/v1/profile/';
		if (id && typeof id === "string")
			path += `${id}/`

		const { payload } = await apiRequest({
			hostname: 'api-invest-gw.tinkoff.ru',
			path,
			method: 'GET',
			headers: session.user.getInvestingHeaders(),
			query: {
				sessionId: session.getSessionId(),
				deviceId: session.user.getDeviceId(),
				// userAgent: session.user.getInvestingUserAgent(),
				appVersion: session.user.getAppVersion(),
				platform: session.user.getPlatform(),
				origin: session.user.getOrigin(),
				ccc: session.user.getCCC(),
				cpswc: session.user.getCPSWC()
			}
		});
		return new Profile({ data: payload });

	}

}

module.exports = ProfileEndpoint;
