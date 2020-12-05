const Profile = require("../../objects/Profile.js");

const PATH = "/social/v1/profile/catalog";

module.exports = {

	/*
		Method: api.social.profileCatalog.get()
		Description: get list of recommended profiles for subscription
		Args:
		  - nextCursor (integer, optional, by default unset)
		  - limit      (integer, optional, by default 50)
		Returns: array of Profiles
	*/
	get: async function({ nextCursor = null, limit = 50, api = this }) {

		let parameters = {
			path: PATH,
			hostname: 'api-invest-gw.tinkoff.ru',
			query: {}
		};

		if (typeof limit === "string") limit = parseInt(limit);
		if (typeof limit === "number" && !isNaN(limit) && limit > 0) {
			parameters.query.limit = limit;
		} else {
			throw new Error("Limit is invalid");
		}

		if (nextCursor !== null) {
			if (typeof nextCursor === "string") nextCursor = parseInt(nextCursor);
			if (typeof nextCursor === "number" && !isNaN(nextCursor) && nextCursor > 0) {
				parameters.query.nextCursor = nextCursor;
			} else {
				throw new Error("Cursor is invalid");
			}
		}

		const { payload } = await api.request(parameters);

		let list = [];

		for (const profile of payload.items)
			list.push(new Profile({ profile, api }));

		if (payload.hasNext)
			list.next = async () => {
				return api.social.profileCatalog.get({
					nextCursor: payload.nextCursor,
					limit,
					api
				});
			}

		return list;

	}
}
