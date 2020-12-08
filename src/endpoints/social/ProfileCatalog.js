const apiRequest = require('../../request.js');

class ProfileCatalogEndpoint {

	static async get({
		session,
		storage,
		nextCursor = null,
		nickname = null,
		limit = 50
	}) {

		const query = {};

		if (typeof nickname === 'string') {
			query.nickname = nickname;
		}

		if (typeof limit === "string") limit = parseInt(limit);
		if (typeof limit === "number" && !isNaN(limit) && limit > 0) {
			query.limit = limit;
		} else {
			throw new Error("Limit is invalid");
		}

		if (nextCursor !== null) {
			if (typeof nextCursor === "string") nextCursor = parseInt(nextCursor);
			if (typeof nextCursor === "number" && !isNaN(nextCursor) && nextCursor > 0) {
				query.nextCursor = nextCursor;
			} else {
				throw new Error("Cursor is invalid");
			}
		}

		const { payload } = await apiRequest({
			hostname: 'api-invest-gw.tinkoff.ru',
			path: '/social/v1/profile/catalog',
			method: 'GET',
			headers: Object.assign({}, session.user.getInvestingHeaders()),
			query: {
				sessionId: session.getSessionId(),
				deviceId: session.user.getDeviceId(),
				appVersion: session.user.getAppVersion(),
				platform: session.user.getPlatform(),
				origin: session.user.getOrigin(),
				ccc: session.user.getCCC(),
				cpswc: session.user.getCPSWC(),
				...query
			}
		});

		let list = [];

		for (const profile of payload.items)
			list.push(storage.profiles.createOrUpdateProfile({ data: profile }));

		// TODO: this is a WA
		if (payload.hasNext) {
			list.hasNext = () => true;
			list.getNext = async () => {
				return ProfileCatalogEndpoint.get({
					session,
					storage,
					nextCursor: payload.nextCursor,
					limit
				});
			}
		} else {
			list.hasNext = () => false;
		}

		return list;

	}

}

module.exports = ProfileCatalogEndpoint;
